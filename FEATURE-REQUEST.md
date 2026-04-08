# Tailwind Visual HTML Editor - Feature Request & Implementation Spec

## Section 1: Project Setup

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- CodeMirror 6 (code editing)
- react-hot-toast (notifications)

**Setup Command:**
```bash
npx create-next-app@latest tailwind-editor --typescript --tailwind --app --eslint
npm install zustand @codemirror/lang-html @codemirror/theme-one-dark @codemirror/view react-hot-toast
```

**Core Constraints:**
- Client-side only for MVP. No backend.
- No persistence. Single-session editor. User pastes HTML, edits, copies result.
- No authentication. Assumes single-user browser environment.
- Sandboxed iframe for HTML preview. Tailwind CDN injected automatically.

---

## Section 2: Architecture Overview

**Three-Layer Architecture:**

1. **Parent Window (Next.js React):**
   - Zustand store (single source of truth)
   - React components (Editor, Toolbar, Sidebars, Modals)
   - DOM manipulation via DOMParser, element selection via path
   - postMessage sender to iframe

2. **Iframe (User's HTML):**
   - Sandboxed execution (sandbox="allow-scripts allow-same-origin")
   - Auto-injected Tailwind CDN (if missing)
   - Auto-injected editor bridge script (click/hover handlers)
   - Auto-assigned data-editor-path attributes on every element
   - postMessage receiver from parent

3. **Data Flow:**
   - User clicks element in iframe → iframe postMessages to parent
   - Parent receives message → Zustand store updates
   - Store change → React re-render → PreviewPane re-renders iframe srcDoc
   - Iframe loads → bridge script re-assigns paths → element becomes clickable again

**HTML Manipulation Strategy:**
- All HTML edits via DOMParser + serialization (string-based, not virtual DOM)
- No markup pollution: only add `data-editor-path` and editor bridge script during preview
- Clean export: strip all `data-editor-*` attributes, remove bridge script, remove auto-injected Tailwind CDN before copy/export

**Path-Based Selection:**
- Format: `0>1>3>0` (array indices of child elements, root is empty string "")
- Zero performance overhead: paths computed once on iframe load
- No external library. Custom algorithm in `lib/html-utils.ts`
- Example: `<div><p><span>text</span></p><button></button></div>` → span path = `0>0>0`, button path = `0>1`

---

## Section 3: State Shape (TypeScript)

```typescript
interface EditorState {
  // ---- Content ----
  html: string;
  history: string[];
  historyIndex: number;

  // ---- Selection ----
  selectedPath: string | null;
  selectedTag: string;
  selectedClasses: string[];
  selectedText: string;
  selectedAttrs: Record<string, string>;

  // ---- UI State ----
  view: 'preview' | 'code';
  leftPanel: 'none' | 'tree' | 'add';
  device: 'mobile' | 'tablet' | 'desktop';

  // ---- Actions ----
  setHtml: (html: string) => void;
  applyClassChange: (classes: string[]) => void;
  applyTextChange: (text: string) => void;
  applyAttrChange: (name: string, value: string) => void;
  removeAttr: (name: string) => void;
  deleteElement: () => void;
  duplicateElement: () => void;
  moveElement: (direction: 'up' | 'down') => void;
  addElement: (html: string, position: 'inside' | 'before' | 'after') => void;
  selectElement: (path: string | null) => void;
  undo: () => void;
  redo: () => void;
  setView: (view: 'preview' | 'code') => void;
  setLeftPanel: (panel: 'none' | 'tree' | 'add') => void;
  setDevice: (device: 'mobile' | 'tablet' | 'desktop') => void;
}
```

---

## Section 4: File/Folder Structure

```
src/
├── app/
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Main editor page
│   └── globals.css                     # Global styles
│
├── store/
│   └── editor-store.ts                 # Zustand store (state + actions)
│
├── components/
│   ├── Editor.tsx                      # Main layout: grid layout with toolbar, sidebars, preview
│   ├── Toolbar.tsx                     # Top bar: paste, undo/redo, view toggle, device, export
│   ├── PreviewPane.tsx                 # Iframe wrapper (srcDoc-based)
│   ├── CodePane.tsx                    # CodeMirror 6 editor
│   │
│   ├── sidebar/
│   │   ├── RightSidebar.tsx            # Properties panel (shows when element selected)
│   │   ├── TextEditor.tsx              # Inline text node editing
│   │   ├── ClassEditor.tsx             # Dual-mode class editor (raw + visual)
│   │   ├── ColorPicker.tsx             # Tailwind color grid (19 families × 11 shades)
│   │   ├── SpacingEditor.tsx           # Padding, margin, gap controls
│   │   ├── TypographyEditor.tsx        # Font size, weight, family
│   │   ├── LayoutEditor.tsx            # Display, flex, grid, width, height
│   │   ├── BorderEditor.tsx            # Border radius, width, color
│   │   └── AttributeEditor.tsx         # Tag-specific attributes (href, src, alt, etc.)
│   │
│   ├── tree/
│   │   ├── ElementTree.tsx             # Left panel DOM tree navigator
│   │   └── TreeNode.tsx                # Individual tree node (collapsible)
│   │
│   ├── add/
│   │   ├── AddElementPanel.tsx         # Left panel element templates
│   │   ├── ElementTemplate.tsx         # Individual template card
│   │   └── InsertPositionSelect.tsx    # Radio group: inside/before/after
│   │
│   ├── modals/
│   │   ├── PasteHtmlModal.tsx          # Paste/load HTML textarea modal
│   │   └── ConfirmModal.tsx            # Generic confirm dialog (delete element, etc.)
│   │
│   └── ui/
│       ├── DeviceSwitcher.tsx          # Mobile/Tablet/Desktop toggle
│       ├── ViewToggle.tsx              # Preview/Code toggle
│       └── Tooltip.tsx                 # Hover tooltip component
│
├── lib/
│   ├── html-utils.ts                   # DOMParser: parse, serialize, path resolution
│   ├── iframe-bridge.ts                # postMessage protocol definitions + iframe script template
│   ├── tailwind-classes.ts             # Tailwind token parsing, color map, class categorization
│   └── element-templates.ts            # Predefined element HTML strings (BASIC, INTERACTIVE, MEDIA, LAYOUT only)
│
├── types/
│   ├── editor.ts                       # Shared types (EditorState, etc.)
│   └── iframe.ts                       # postMessage types (MessageEvent payloads)
│
└── public/
    └── iframe-bridge.js                # Iframe script (injected into srcDoc)
```

---

## Section 5: Core Data Flow

**Scenario 1: User Clicks Element in Preview**

1. User clicks `<button>` in iframe preview
2. Iframe bridge script (injected): click handler fires
3. Traverse DOM from clicked element to root, resolve path (e.g., `0>1>2`)
4. Extract: tag name, all classes, direct text content, all attributes
5. postMessage to parent: `{ type: 'element-selected', path: '0>1>2', tag: 'button', classes: ['px-4', 'py-2', 'bg-blue-500'], text: 'Click me', attrs: { onClick: '...' } }`
6. Parent window receives message
7. Zustand store: `selectElement(path)` → updates selectedPath, selectedTag, selectedClasses, selectedText, selectedAttrs
8. React re-renders: RightSidebar becomes visible, populated with element properties
9. Iframe visual feedback: element gets blue solid outline (selected) + light blue overlay

**Scenario 2: User Edits Class in Visual Editor**

1. User clicks color swatch in ColorPicker (e.g., bg-red-500)
2. ColorPicker component calls: `store.applyClassChange(['px-4', 'py-2', 'bg-red-500'])`
3. Zustand action:
   - Get current HTML string from store.html
   - Parse via DOMParser: `new DOMParser().parseFromString(html, 'text/html')`
   - Find element by path using `resolvePathToElement(path)`
   - Update element.className = newClasses.join(' ')
   - Serialize DOM back to string via custom serializer
   - Push current HTML to history array (BEFORE mutation)
   - Update store.html = new HTML string
4. PreviewPane component watches store.html, re-renders iframe:
   - Compute injected HTML (Tailwind CDN + bridge script + data-editor-path)
   - Set iframe.srcDoc = injected HTML
5. Iframe loads:
   - Bridge script runs, assigns data-editor-path to every element
   - If selectedPath still valid, re-apply blue outline to that element
   - Iframe is ready for next click

**Scenario 3: User Edits Code Mode**

1. User clicks "Code" button in ViewToggle
2. store.setView('code') → React renders CodePane instead of PreviewPane
3. CodePane: CodeMirror displays store.html
4. User types in CodeMirror (debounced: 200ms)
5. On blur or after debounce: parse CodeMirror value
6. Call store.setHtml(newHtml) → updates store.html, clears selectedPath
7. On switch back to Preview:
   - ViewToggle calls store.setView('preview')
   - PreviewPane re-renders iframe with new HTML
   - Iframe element tree rebuilt, paths re-assigned

---

## Section 6: Feature Specifications (ALL PHASES)

### PHASE 1: Core Editor (P0)

#### Feature 1: HTML Input & Rendering

**Components:**
- `PasteHtmlModal.tsx`: Modal with textarea, "Load HTML" button, cancel button
- `PreviewPane.tsx`: Iframe wrapper

**Behavior:**
1. On page load: show PasteHtmlModal (if no project loaded)
2. User pastes single-file Tailwind HTML into textarea
3. User clicks "Load HTML"
4. Modal closes, HTML loaded into store.html
5. PreviewPane renders iframe with:
   - User's HTML as base
   - Auto-inject Tailwind CDN if `<script src="...cdn.tailwindcss.com...">` not found:
     ```html
     <script src="https://cdn.tailwindcss.com"></script>
     ```
   - Auto-inject iframe bridge script (see Feature 2)
   - Auto-assign data-editor-path to every element (see Feature 2)

**Iframe Sandbox Attributes:**
```html
<iframe
  sandbox="allow-scripts allow-same-origin"
  srcDoc={injectedHtml}
  style={{ width: '100%', border: 'none', minHeight: '100vh' }}
/>
```

**Validation:**
- If HTML is malformed, DOMParser normalizes it (standard HTML5 parsing rules)
- If Tailwind CDN is from different source, leave it (don't duplicate)

---

#### Feature 2: Element Selection

**Iframe Bridge Script (`public/iframe-bridge.js`):**
```javascript
// Injected into iframe srcDoc on every render

(function() {
  // Assign data-editor-path to every element
  function assignPaths(el, path = '') {
    el.dataset.editorPath = path;
    let childIndex = 0;
    for (let child of el.children) {
      assignPaths(child, path ? `${path}>${childIndex}` : childIndex.toString());
      childIndex++;
    }
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const el = event.target.closest('[data-editor-path]');
    if (!el) return;
    
    const path = el.dataset.editorPath;
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList);
    const text = el.childNodes
      .filter(n => n.nodeType === 3) // Text nodes only
      .map(n => n.textContent)
      .join('');
    const attrs = {};
    for (let attr of el.attributes) {
      if (!attr.name.startsWith('data-editor-')) {
        attrs[attr.name] = attr.value;
      }
    }
    
    window.parent.postMessage({
      type: 'element-selected',
      path,
      tag,
      classes,
      text,
      attrs
    }, '*');
  }

  function handleHover(event) {
    const el = event.target.closest('[data-editor-path]');
    if (el) {
      el.style.outline = '2px dashed #3b82f6';
      el.style.outlineOffset = '-2px';
    }
  }

  function handleHoverOut(event) {
    const el = event.target.closest('[data-editor-path]');
    if (el && el.dataset.editorPath !== window.__selectedPath) {
      el.style.outline = 'none';
    }
  }

  // On load: assign paths to entire tree
  document.addEventListener('DOMContentLoaded', () => {
    assignPaths(document.documentElement);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      assignPaths(document.documentElement);
    });
  } else {
    assignPaths(document.documentElement);
  }

  // Click handler
  document.addEventListener('click', handleClick, true);
  
  // Hover handlers
  document.addEventListener('mouseover', handleHover, true);
  document.addEventListener('mouseout', handleHoverOut, true);

  // Receive selection from parent
  window.addEventListener('message', (event) => {
    if (event.data.type === 'select-element') {
      const path = event.data.path;
      const el = document.querySelector(`[data-editor-path="${path}"]`);
      if (el) {
        window.__selectedPath = path;
        el.style.outline = '2px solid #3b82f6';
        el.style.outlineOffset = '-2px';
        el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      }
    }
  });

  // Receive deselection from parent
  window.addEventListener('message', (event) => {
    if (event.data.type === 'deselect-element') {
      const path = window.__selectedPath;
      if (path) {
        const el = document.querySelector(`[data-editor-path="${path}"]`);
        if (el) {
          el.style.outline = 'none';
          el.style.backgroundColor = '';
          window.__selectedPath = null;
        }
      }
    }
  });
})();
```

**Parent Side Selection:**
- In `PreviewPane.tsx`: attach postMessage listener to window
- On message `type: 'element-selected'`: call `store.selectElement(path)` with payload
- Store updates: selectedPath, selectedTag, selectedClasses, selectedText, selectedAttrs
- Send back to iframe: `iframe.contentWindow.postMessage({ type: 'select-element', path }, '*')`

**Keyboard Shortcuts:**
- Escape key: `store.selectElement(null)` + send deselect-element to iframe
- Visual feedback: selected element gets 2px solid blue outline + light blue overlay

---

#### Feature 3: Text Editing

**Component: `TextEditor.tsx`**

```typescript
interface TextEditorProps {
  selectedText: string;
  onTextChange: (text: string) => void;
}

export default function TextEditor({ selectedText, onTextChange }: TextEditorProps) {
  const [text, setText] = useState(selectedText);

  const handleChange = (value: string) => {
    setText(value);
  };

  const handleBlur = () => {
    if (text !== selectedText) {
      onTextChange(text);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Text Content</label>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'Enter') {
            handleBlur();
          }
        }}
        className="w-full border rounded-md px-3 py-2 text-sm font-mono"
        rows={3}
        placeholder="Text content of this element"
      />
    </div>
  );
}
```

**Behavior:**
1. Show in RightSidebar only when element is selected
2. Textarea displays `selectedText` (direct text nodes only, not nested element text)
3. On blur or Ctrl+Enter: call `store.applyTextChange(newText)`
4. Store action: parse HTML, find element by path, update textContent of direct text nodes, serialize, push to history
5. If element has no direct text nodes: textarea empty but editable

**Edge Case:**
- `<p>Hello <strong>world</strong></p>` → TextEditor shows "Hello " only (direct text), not "world"
- Editing here changes only "Hello " part, does not affect `<strong>`

---

#### Feature 4: Tailwind Class Editor

**Component: `ClassEditor.tsx`**

**Structure:**
- Toggle between "Raw" and "Visual" mode
- Raw mode: textarea showing full class string (e.g., `px-4 py-2 bg-blue-500 text-white`)
- Visual mode: categorized controls below

**Raw Mode:**
```typescript
<textarea
  value={classes.join(' ')}
  onChange={(e) => {
    const newClasses = e.target.value.split(/\s+/).filter(Boolean);
    onClassChange(newClasses);
  }}
  className="w-full font-mono text-sm border rounded-md px-3 py-2"
  rows={2}
  placeholder="Enter Tailwind classes separated by spaces"
/>
```

**Visual Mode: Categorized Controls**

---

**TYPOGRAPHY SECTION:**

Font Size:
```
Dropdown: [text-xs | text-sm | text-base | text-lg | text-xl | text-2xl | text-3xl | text-4xl | text-5xl | text-6xl]
On select: smart replace (find existing text-* class, remove, add new one)
```

Font Weight:
```
Dropdown: [font-thin | font-extralight | font-light | font-normal | font-medium | font-semibold | font-bold | font-extrabold | font-black]
On select: smart replace
```

Text Align:
```
Button group: [text-left | text-center | text-right | text-justify]
On click: smart replace
```

---

**COLORS SECTION:**

**ColorPicker Component (`ColorPicker.tsx`):**
```typescript
interface ColorPickerProps {
  colorType: 'text' | 'bg' | 'border';
  currentColor: string; // e.g., 'red-500'
  onColorSelect: (color: string) => void;
}

const TAILWIND_COLORS = [
  { name: 'slate', shades: [50, 100, 200, ..., 950] },
  { name: 'gray', shades: [50, 100, 200, ..., 950] },
  // ... all 19 color families
  { name: 'rose', shades: [50, 100, 200, ..., 950] },
];

export default function ColorPicker({ colorType, currentColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{colorType === 'text' ? 'Text Color' : colorType === 'bg' ? 'Background Color' : 'Border Color'}</label>
      <div className="grid grid-cols-6 gap-2">
        {TAILWIND_COLORS.map((family) => (
          <div key={family.name}>
            {family.shades.map((shade) => {
              const className = `${colorType}-${family.name}-${shade}`;
              const isSelected = currentColor === className;
              return (
                <button
                  key={className}
                  className={`w-6 h-6 rounded border-2 ${isSelected ? 'border-black' : 'border-gray-300'}`}
                  style={{ backgroundColor: getTailwindColor(family.name, shade) }}
                  onClick={() => onColorSelect(className)}
                  title={className}
                />
              );
            })}
          </div>
        ))}
        {/* Special colors */}
        <button className="w-6 h-6 rounded border-2 border-gray-300 bg-white" onClick={() => onColorSelect(`${colorType}-white`)} />
        <button className="w-6 h-6 rounded border-2 border-gray-300 bg-black" onClick={() => onColorSelect(`${colorType}-black`)} />
        <button className="w-6 h-6 rounded border-2 border-gray-300 bg-transparent" onClick={() => onColorSelect(`${colorType}-transparent`)} />
      </div>
    </div>
  );
}
```

Text Color: ColorPicker(colorType='text')
Background Color: ColorPicker(colorType='bg')
Border Color: ColorPicker(colorType='border')

Behavior: On select, smart replace (find existing text-*, bg-*, border-* color classes, remove, add new)

---

**SPACING SECTION:**

Padding Controls:
```
- p (all sides): Dropdown [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64]
- px (horizontal): Dropdown with same values
- py (vertical): Dropdown with same values
- pt (top), pr (right), pb (bottom), pl (left): Dropdown with same values
```

Margin Controls: Same structure as padding, with m prefix, plus "auto" option

Gap Controls: gap, gap-x, gap-y with same values as padding

Smart replace: when user changes p-4 to p-6, remove p-4, add p-6. If p-4 and px-2 both exist, user choosing p-6 removes both and adds p-6.

---

**BORDER SECTION:**

Border Radius:
```
Button group: [rounded-none | rounded-sm | rounded | rounded-md | rounded-lg | rounded-xl | rounded-2xl | rounded-3xl | rounded-full]
```

Border Width:
```
Dropdown: [border-0 | border | border-2 | border-4 | border-8]
```

---

**LAYOUT SECTION:**

Display:
```
Button group: [block | inline-block | inline | flex | inline-flex | grid | hidden]
```

Flex Direction (show only when display is flex):
```
Button group: [flex-row | flex-col | flex-row-reverse | flex-col-reverse]
```

Justify Content (show only when display is flex or grid):
```
Button group: [justify-start | justify-center | justify-end | justify-between | justify-around | justify-evenly]
```

Align Items (show only when display is flex or grid):
```
Button group: [items-start | items-center | items-end | items-stretch | items-baseline]
```

Width:
```
Dropdown: [w-auto | w-full | w-fit | w-screen | w-1/2 | w-1/3 | w-2/3 | w-1/4 | w-3/4]
```

Height:
```
Dropdown: [h-auto | h-full | h-fit | h-screen]
```

---

**Smart Class Replacement Algorithm (`lib/tailwind-classes.ts`):**

```typescript
export function replaceClass(
  classes: string[],
  category: string, // 'text-size', 'text-color', 'padding', 'display', etc.
  newClass: string
): string[] {
  // Remove all classes in the same category
  const filtered = classes.filter((c) => !isSameCategory(c, category));
  // Add new class
  return [...filtered, newClass];
}

function isSameCategory(className: string, category: string): boolean {
  if (category === 'text-size') {
    return /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/.test(className);
  }
  if (category === 'text-color') {
    return /^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\d+)?$/.test(className);
  }
  // ... more categories
  return false;
}
```

---

#### Feature 5: Attribute Editor

**Component: `AttributeEditor.tsx`**

**Tag-Specific Attributes:**

**\<a\> tag:**
- href: text input
- target: dropdown (\_blank, \_self, \_parent, \_top)
- rel: text input (space-separated: noopener, noreferrer, etc.)

**\<img\> tag:**
- src: text input (or upload button → Feature 15)
- alt: text input
- width: number input
- height: number input
- loading: dropdown (lazy, eager)

**\<button\> tag:**
- type: dropdown (button, submit, reset)
- disabled: checkbox

**\<input\> tag:**
- type: dropdown (text, email, password, number, checkbox, radio, file, date, etc.)
- placeholder: text input
- name: text input
- value: text input
- required: checkbox

**\<video\> tag:**
- src: text input
- poster: text input
- controls: checkbox
- autoplay: checkbox
- loop: checkbox
- muted: checkbox

**\<iframe\> tag:**
- src: text input
- width: number input
- height: number input
- title: text input

**ALL Elements:**
- id: text input
- class: read-only display (use ClassEditor instead)
- title: text input
- aria-label: text input

**UI Layout:**
```typescript
export default function AttributeEditor({ selectedAttrs, selectedTag, onAttrChange, onAttrRemove }: Props) {
  const attrs = getRelevantAttrs(selectedTag);
  
  return (
    <div className="space-y-3 border-t pt-3">
      <h3 className="font-semibold text-sm">Attributes</h3>
      
      {attrs.map((attr) => (
        <div key={attr.name} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium block mb-1">{attr.label}</label>
            {attr.type === 'text' && (
              <input
                type="text"
                value={selectedAttrs[attr.name] || ''}
                onChange={(e) => onAttrChange(attr.name, e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            )}
            {attr.type === 'number' && (
              <input
                type="number"
                value={selectedAttrs[attr.name] || ''}
                onChange={(e) => onAttrChange(attr.name, e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            )}
            {attr.type === 'checkbox' && (
              <input
                type="checkbox"
                checked={selectedAttrs[attr.name] !== undefined}
                onChange={(e) => {
                  if (e.target.checked) {
                    onAttrChange(attr.name, '');
                  } else {
                    onAttrRemove(attr.name);
                  }
                }}
                className="w-4 h-4"
              />
            )}
            {attr.type === 'select' && (
              <select
                value={selectedAttrs[attr.name] || ''}
                onChange={(e) => onAttrChange(attr.name, e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {attr.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
          {selectedAttrs[attr.name] !== undefined && (
            <button
              onClick={() => onAttrRemove(attr.name)}
              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Add Custom Attribute */}
      <button
        onClick={() => {
          const name = prompt('Attribute name:');
          if (name) onAttrChange(name, '');
        }}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add Custom Attribute
      </button>
    </div>
  );
}
```

---

#### Feature 6: Code Mode

**Component: `CodePane.tsx`**

```typescript
import { useCodeMirror } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CodePane({ html: currentHtml, onHtmlChange }: Props) {
  const [value, setValue] = useState(currentHtml);
  const [inputRef, editorView] = useCodeMirror({
    value: currentHtml,
    height: '100vh',
    extensions: [html()],
    theme: oneDark,
    onChange: (val) => setValue(val),
  });

  const handleSwitchToPreview = () => {
    // Parse and update store with current editor value
    onHtmlChange(value);
  };

  return (
    <div ref={inputRef} />
  );
}
```

**Behavior:**
- ViewToggle in Toolbar: "Preview" and "Code" buttons
- Clicking "Code" sets store.view = 'code'
- CodePane renders with CodeMirror
- CodeMirror settings: html language, oneDark theme, line numbers, bracket matching, line wrapping
- Debounced onChange (200ms): updates local state, not store (avoid re-rendering preview on every keystroke)
- On switch back to Preview: parse CodeMirror value with DOMParser, call store.setHtml(newHtml)
- If HTML invalid: show error toast, don't switch back

---

#### Feature 7: Undo/Redo

**State Management (in Zustand):**

```typescript
interface EditorStore {
  html: string;
  history: string[];
  historyIndex: number;

  setHtml: (html: string) => void;
  pushToHistory: (html: string) => void;
  undo: () => void;
  redo: () => void;
}

// Implementation:
const editorStore = create<EditorStore>((set, get) => ({
  html: '',
  history: [],
  historyIndex: -1,

  setHtml: (html: string) => {
    const { history, historyIndex } = get();
    // Trim future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(html);
    // Keep max 100 entries
    if (newHistory.length > 100) {
      newHistory.shift();
    }
    set({
      html,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  pushToHistory: (html: string) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(html);
    if (newHistory.length > 100) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        html: history[newIndex],
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        html: history[newIndex],
      });
    }
  },
}));
```

**Keyboard Shortcuts:**
- Ctrl+Z: store.undo()
- Ctrl+Shift+Z: store.redo()

**Toolbar Buttons:**
- Undo button: disabled when historyIndex === 0
- Redo button: disabled when historyIndex === history.length - 1

**Every Mutation Must Push to History:**
- applyClassChange, applyTextChange, applyAttrChange, deleteElement, duplicateElement, moveElement, addElement
- All call: pushToHistory(currentHtml) BEFORE modifying, then setHtml(newHtml)

---

#### Feature 8: Copy/Export HTML

**Component: Toolbar button "Copy HTML"**

**Process:**
1. User clicks "Copy HTML"
2. Store: get current HTML
3. Parse with DOMParser
4. Remove all data-editor-* attributes from every element
5. Remove iframe bridge script (querySelector script containing 'element-selected')
6. Remove Tailwind CDN if it was auto-injected (check if src contains 'cdn.tailwindcss.com')
7. Serialize cleaned HTML to string
8. Copy to clipboard: `navigator.clipboard.writeText(cleanedHtml)`
9. Show toast: "HTML copied!"

```typescript
export function cleanHtmlForExport(html: string, wasAutoInjected: boolean): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove data-editor-* attributes
  doc.querySelectorAll('[data-editor-path]').forEach((el) => {
    el.removeAttribute('data-editor-path');
    el.removeAttribute('data-editor-tag');
    el.removeAttribute('data-editor-classes');
  });

  // Remove bridge script
  doc.querySelectorAll('script').forEach((script) => {
    if (script.textContent?.includes('element-selected')) {
      script.remove();
    }
  });

  // Remove auto-injected Tailwind CDN
  if (wasAutoInjected) {
    doc.querySelectorAll('script').forEach((script) => {
      if (script.src && script.src.includes('cdn.tailwindcss.com')) {
        script.remove();
      }
    });
  }

  return serializeToHtmlString(doc);
}
```

---

### PHASE 2: Navigation & Manipulation (P1)

#### Feature 9: Responsive Device Preview

**Component: `DeviceSwitcher.tsx`**

```typescript
export default function DeviceSwitcher({ device, onDeviceChange }: Props) {
  const devices = [
    { id: 'mobile', label: '📱 Mobile (375px)', width: 375 },
    { id: 'tablet', label: '📱 Tablet (768px)', width: 768 },
    { id: 'desktop', label: '🖥️ Desktop (100%)', width: '100%' },
  ];

  return (
    <div className="flex gap-1">
      {devices.map((d) => (
        <button
          key={d.id}
          onClick={() => onDeviceChange(d.id as any)}
          className={`px-3 py-1 text-xs rounded ${
            device === d.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
```

**Iframe Container Styling:**
```css
.preview-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background-color: #f3f4f6;
  min-height: 100vh;
}

.iframe-wrapper {
  width: var(--device-width);
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
}

.iframe-wrapper.mobile {
  --device-width: 375px;
}

.iframe-wrapper.tablet {
  --device-width: 768px;
}

.iframe-wrapper.desktop {
  --device-width: 100%;
}
```

**Behavior:**
1. store.setDevice(device) updates device state
2. PreviewPane watches device, adjusts iframe container width
3. Tailwind responsive breakpoints auto-trigger based on actual viewport width of iframe
4. Smooth CSS transition on width change

---

#### Feature 10: Element Tree Navigator

**Component: `ElementTree.tsx`**

```typescript
export default function ElementTree({ html, selectedPath, onSelectElement }: Props) {
  const root = parseHtmlToTree(html);

  return (
    <div className="p-3 overflow-auto">
      <h3 className="font-semibold text-sm mb-2">DOM Tree</h3>
      <TreeNode
        node={root}
        path=""
        selectedPath={selectedPath}
        onSelectElement={onSelectElement}
        expanded={true}
      />
    </div>
  );
}
```

**Component: `TreeNode.tsx`**

```typescript
interface TreeNodeProps {
  node: TreeNode;
  path: string;
  selectedPath: string | null;
  onSelectElement: (path: string | null) => void;
  expanded?: boolean;
}

export default function TreeNode({
  node,
  path,
  selectedPath,
  onSelectElement,
  expanded: initialExpanded = false,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const isSelected = path === selectedPath;
  const hasChildren = node.children.length > 0;

  const displayText = `<${node.tag}> ${
    node.classes.length > 0 ? `.${node.classes.join('.')}` : ''
  } ${node.text ? `"${node.text.substring(0, 30)}${node.text.length > 30 ? '...' : ''}"` : ''}`.trim();

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm font-mono
          ${isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : 'hover:bg-gray-100'}
        `}
        onClick={() => onSelectElement(path)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span>{displayText}</span>
      </div>

      {expanded && hasChildren && (
        <div className="ml-4 border-l border-gray-200">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              path={path ? `${path}>${index}` : index.toString()}
              selectedPath={selectedPath}
              onSelectElement={onSelectElement}
              expanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Tree Parsing (`lib/html-utils.ts`):**

```typescript
interface TreeNode {
  tag: string;
  classes: string[];
  text: string;
  children: TreeNode[];
}

export function parseHtmlToTree(html: string): TreeNode {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return elementToTreeNode(doc.documentElement);
}

function elementToTreeNode(el: Element): TreeNode {
  return {
    tag: el.tagName.toLowerCase(),
    classes: Array.from(el.classList),
    text: el.childNodes
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent || '')
      .join('')
      .trim(),
    children: Array.from(el.children).map((child) => elementToTreeNode(child)),
  };
}
```

**Behavior:**
- Root expanded by default, children collapsed
- Click node to select element in preview
- Auto-expand nodes on parent to show selected element
- Visual highlight: selected node has blue background + left border

---

#### Feature 11: Element Actions

**Component: `ElementActions.tsx`** (in RightSidebar header)

```typescript
export default function ElementActions({
  selectedPath,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  return (
    <div className="flex gap-2 border-b pb-3 mb-3">
      <button
        onClick={onDelete}
        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
        title="Delete element (Delete key)"
      >
        🗑️ Delete
      </button>
      <button
        onClick={onDuplicate}
        className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded text-xs"
        title="Duplicate element (Ctrl+D)"
      >
        📋 Duplicate
      </button>
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className={`px-2 py-1 rounded text-xs ${
          canMoveUp ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
        }`}
        title="Move up"
      >
        ⬆️ Up
      </button>
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className={`px-2 py-1 rounded text-xs ${
          canMoveDown ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
        }`}
        title="Move down"
      >
        ⬇️ Down
      </button>
    </div>
  );
}
```

**Actions Implementation (in Zustand store):**

**Delete:**
```typescript
deleteElement: () => {
  const { html, selectedPath } = get();
  const el = resolvePathToElement(html, selectedPath);
  if (!el?.parentElement) return;
  
  pushToHistory(html);
  el.parentElement.removeChild(el);
  const newHtml = serializeToHtmlString(el.ownerDocument);
  
  set({
    html: newHtml,
    selectedPath: null,
  });
}
```

**Duplicate:**
```typescript
duplicateElement: () => {
  const { html, selectedPath } = get();
  const el = resolvePathToElement(html, selectedPath);
  if (!el?.parentElement) return;
  
  pushToHistory(html);
  const clone = el.cloneNode(true);
  el.parentElement.insertBefore(clone, el.nextSibling);
  const newHtml = serializeToHtmlString(el.ownerDocument);
  
  // Calculate path of clone (next sibling)
  const newPath = calculatePathAfterDuplicate(selectedPath);
  
  set({
    html: newHtml,
    selectedPath: newPath,
  });
}
```

**Move Up:**
```typescript
moveElement: (direction: 'up' | 'down') => {
  const { html, selectedPath } = get();
  const el = resolvePathToElement(html, selectedPath);
  if (!el?.parentElement) return;
  
  pushToHistory(html);
  
  if (direction === 'up' && el.previousElementSibling) {
    el.parentElement.insertBefore(el, el.previousElementSibling);
  } else if (direction === 'down' && el.nextElementSibling) {
    el.parentElement.insertBefore(el.nextElementSibling, el);
  }
  
  const newHtml = serializeToHtmlString(el.ownerDocument);
  const newPath = calculatePathAfterMove(selectedPath, direction);
  
  set({
    html: newHtml,
    selectedPath: newPath,
  });
}
```

**Confirmation Modal:**
```typescript
// ConfirmModal.tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 shadow-lg">
    <h3 className="font-semibold mb-4">Delete this element?</h3>
    <div className="flex gap-2 justify-end">
      <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
    </div>
  </div>
</div>
```

---

#### Feature 12: Add New Elements

**Component: `AddElementPanel.tsx`**

**Note: Composite templates (Card, Hero, Navbar, Footer, etc.) intentionally excluded. Users plan full sections in LP Generator module -- HTML Editor is for tweaking, not building from scratch.**

```typescript
const ELEMENT_TEMPLATES = {
  BASIC: [
    { id: 'div', label: 'Div', html: '<div class="p-4">New div</div>' },
    { id: 'section', label: 'Section', html: '<section class="py-12 px-4">New section</section>' },
    { id: 'h1', label: 'Heading H1', html: '<h1 class="text-4xl font-bold">Heading</h1>' },
    { id: 'h2', label: 'Heading H2', html: '<h2 class="text-3xl font-semibold">Heading</h2>' },
    { id: 'h3', label: 'Heading H3', html: '<h3 class="text-2xl font-semibold">Heading</h3>' },
    { id: 'p', label: 'Paragraph', html: '<p class="text-base text-gray-700">Paragraph text</p>' },
    { id: 'span', label: 'Span', html: '<span>Inline text</span>' },
  ],
  INTERACTIVE: [
    {
      id: 'button',
      label: 'Button',
      html: '<button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Button</button>',
    },
    {
      id: 'link',
      label: 'Link',
      html: '<a href="#" class="text-blue-600 hover:underline">Link text</a>',
    },
    {
      id: 'input',
      label: 'Input',
      html: '<input type="text" class="border rounded-lg px-4 py-2 w-full" placeholder="Enter text..." />',
    },
    {
      id: 'textarea',
      label: 'Textarea',
      html: '<textarea class="border rounded-lg px-4 py-2 w-full" rows="4" placeholder="Enter text..."></textarea>',
    },
  ],
  MEDIA: [
    {
      id: 'img',
      label: 'Image',
      html: '<img src="https://placehold.co/600x400" alt="Placeholder" class="w-full rounded-lg" />',
    },
    {
      id: 'video',
      label: 'Video',
      html: '<video controls class="w-full rounded-lg"><source src="" type="video/mp4" /></video>',
    },
  ],
  LAYOUT: [
    {
      id: 'flex-row',
      label: 'Flex Row',
      html: '<div class="flex gap-4"><div class="flex-1 p-4 border rounded">Item 1</div><div class="flex-1 p-4 border rounded">Item 2</div></div>',
    },
    {
      id: 'flex-col',
      label: 'Flex Column',
      html: '<div class="flex flex-col gap-4"><div class="p-4 border rounded">Item 1</div><div class="p-4 border rounded">Item 2</div></div>',
    },
    {
      id: 'grid-2',
      label: 'Grid 2-col',
      html: '<div class="grid grid-cols-2 gap-4"><div class="p-4 border rounded">Item 1</div><div class="p-4 border rounded">Item 2</div></div>',
    },
    {
      id: 'grid-3',
      label: 'Grid 3-col',
      html: '<div class="grid grid-cols-3 gap-4"><div class="p-4 border rounded">Item 1</div><div class="p-4 border rounded">Item 2</div><div class="p-4 border rounded">Item 3</div></div>',
    },
  ],
};
```

**UI:**
```typescript
export default function AddElementPanel({ selectedPath, onAddElement }: Props) {
  const [insertPosition, setInsertPosition] = useState<'inside' | 'before' | 'after'>('inside');

  const handleAddElement = (templateHtml: string) => {
    onAddElement(templateHtml, insertPosition);
  };

  return (
    <div className="p-3 space-y-4 overflow-auto">
      <h3 className="font-semibold text-sm">Add Element</h3>

      <div className="space-y-2">
        <label className="text-xs font-medium">Insert Position</label>
        <div className="flex gap-2">
          {(['inside', 'before', 'after'] as const).map((pos) => (
            <label key={pos} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                value={pos}
                checked={insertPosition === pos}
                onChange={(e) => setInsertPosition(e.target.value as any)}
                className="w-4 h-4"
              />
              <span className="text-xs capitalize">{pos}</span>
            </label>
          ))}
        </div>
      </div>

      {Object.entries(ELEMENT_TEMPLATES).map(([category, templates]) => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <ElementTemplate
                key={template.id}
                label={template.label}
                onClick={() => handleAddElement(template.html)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Component: `ElementTemplate.tsx`**

```typescript
export default function ElementTemplate({ label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="p-2 border rounded-lg hover:bg-blue-50 text-xs font-medium text-center cursor-pointer"
    >
      {label}
    </button>
  );
}
```

**Store Action:**
```typescript
addElement: (html: string, position: 'inside' | 'before' | 'after') => {
  const { html: currentHtml, selectedPath } = get();
  
  pushToHistory(currentHtml);
  
  const doc = new DOMParser().parseFromString(currentHtml, 'text/html');
  const fragment = new DOMParser().parseFromString(html, 'text/html').body.childNodes;
  
  if (selectedPath && position !== 'inside') {
    const el = resolvePathToElement(currentHtml, selectedPath);
    if (el?.parentElement) {
      if (position === 'before') {
        fragment.forEach((node) => el.parentElement.insertBefore(node, el));
      } else {
        fragment.forEach((node) => el.parentElement.insertBefore(node, el.nextSibling));
      }
    }
  } else {
    const parent = selectedPath ? resolvePathToElement(currentHtml, selectedPath) : doc.body;
    if (parent) {
      fragment.forEach((node) => parent.appendChild(node));
    }
  }
  
  const newHtml = serializeToHtmlString(doc);
  set({ html: newHtml });
}
```

---



## Section 7: Edge Cases & Technical Constraints

**HTML Parsing & Serialization:**
- Self-closing tags (img, br, hr, input, meta, link): DOMParser normalizes to XHTML-style `/>`. Serializer must output correctly. Test with mixed content.
- Script tags in user HTML: execute in iframe only via sandbox. Never in parent window.
- SVG elements: selectable as atomic units. No deep path traversal inside SVG tree.
- Inline styles: display in AttributeEditor as `style` attribute. No visual controls for inline CSS. User must edit raw style string.

**Tailwind Token Detection:**
- `text-xl` (font size) vs `text-red-500` (text color): parse prefix + token. Check token against known size values vs color values.
- `text-white` (color) vs `text-left` (alignment): detect suffix. If suffix in [left, center, right, justify], it's alignment. Else color.
- Responsive prefixes: `md:text-xl` → extract prefix `md`, utility `text`, value `xl`. Store can parse and manipulate.
- Arbitrary values: `w-[350px]`, `bg-[#ff0000]` → display in raw editor only, NO visual control. Cannot parse arbitrary values safely.

**Nested Text Content:**
- `<p>Hello <strong>world</strong></p>` → TextEditor shows "Hello " only (direct text nodes). Editing TextEditor changes "Hello " to something else, does not affect "world".
- If element has NO direct text (only child elements), TextEditor is empty but editable. User can type, it prepends as text node.

**Large HTML Performance:**
- 1000+ elements: tree might be slow to render. Virtualize tree list in ElementTree (render only visible nodes).
- Code mode: debounce CodeMirror onChange (200ms) before updating store.html (which triggers iframe re-render).
- Iframe reload on every HTML change is acceptable for MVP. If bottleneck detected (e.g., lag on complex edits), implement surgical DOM updates via postMessage.

**History Stack:**
- Max 100 entries per project. Oldest dropped on overflow.
- Every mutation pushes BEFORE modifying.
- historyIndex tracks current position. Mutations truncate future history (redo-safe).

**Iframe Reload Overhead:**
- Every store.html change re-renders iframe srcDoc. This reloads entire iframe (all scripts, styles). Acceptable for MVP.
- If detected as bottleneck: instead of full reload, send postMessage with surgical DOM updates. Low priority for Phase 1.

**Path Stability:**
- Paths assigned on iframe load. If user edits HTML in code mode and changes structure, old selectedPath might become invalid.
- Handling: on iframe load, verify selectedPath still resolves. If not, deselect (selectedPath = null). No error.

---

## Section 8: Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Escape | Deselect element |
| Delete / Backspace | Delete selected element (with confirmation modal) |
| Ctrl+D | Duplicate selected element |
| Ctrl+C (no text selected) | Copy full HTML to clipboard |
| Ctrl+E | Toggle Code/Preview mode |
| Ctrl+1 | Switch to Mobile (375px) preview |
| Ctrl+2 | Switch to Tablet (768px) preview |
| Ctrl+3 | Switch to Desktop (100%) preview |

**Implementation:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'z') {
      if (e.shiftKey) store.redo();
      else store.undo();
    }
    if (e.key === 'Escape') store.selectElement(null);
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPath) {
      showConfirmModal(() => store.deleteElement());
    }
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      store.duplicateElement();
    }
    if (e.ctrlKey && e.key === 'c' && !window.getSelection()?.toString()) {
      e.preventDefault();
      copyHtmlToClipboard();
    }
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      store.setView(store.view === 'preview' ? 'code' : 'preview');
    }
    if (e.ctrlKey && e.key === '1') store.setDevice('mobile');
    if (e.ctrlKey && e.key === '2') store.setDevice('tablet');
    if (e.ctrlKey && e.key === '3') store.setDevice('desktop');
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Section 9: Implementation Order

**Step 1-5: Foundation** (Days 1-3)
1. Project setup (Next.js + dependencies)
2. Zustand store with full EditorState shape
3. PasteHtmlModal + basic iframe rendering
4. Iframe bridge script (click/hover handlers, path assignment, postMessage)
5. Element selection (click to select, Escape to deselect)

**Step 6-12: MVP (Phase 1)** (Days 4-7)
6. RightSidebar with TextEditor
7. ClassEditor (raw mode first)
8. ClassEditor visual controls (typography, colors, spacing, layout, border)
9. AttributeEditor
10. Undo/Redo system
11. Code mode (CodeMirror)
12. Copy/Export HTML

**Checkpoint: MVP complete. Core visual editing functional.**

**Step 13-16: Phase 2 Navigation & Manipulation** (Days 8-10)
13. DeviceSwitcher + responsive iframe
14. ElementTree navigator
15. Element actions (delete, duplicate, move)
16. AddElementPanel with templates (basic + interactive + media + layout only)

**Checkpoint: Phase 2 complete. Product complete. Full DOM manipulation functional.**

---

## Section 10: Decisions Already Made (Do Not Change)

1. **Framework**: Next.js App Router (confirmed). Not Vite, CRA, or other.
2. **State**: Zustand (confirmed). Not Redux, Pinia, Context API, or other.
3. **HTML Manipulation**: DOMParser + string serialization (confirmed). NOT virtual DOM libraries.
4. **Preview**: Sandboxed iframe with srcDoc (confirmed). NOT direct DOM manipulation in parent.
5. **Element Selection**: Path-based (0>1>3>0) (confirmed). NOT ID-based or class-based.
6. **Code Editor**: CodeMirror 6 (confirmed). NOT Monaco, Ace, or other.
7. **Styling**: Tailwind-native class manipulation (confirmed). NOT arbitrary CSS injection or SCSS.
8. **Storage**: None. No localStorage, no backend. Single-session editor. User pastes HTML, edits, copies. Refresh = fresh start.
9. **History**: Max 100 entries, drop oldest (confirmed). NOT unlimited or version control system.
10. **Tailwind CDN**: Auto-inject if missing, use https://cdn.tailwindcss.com (confirmed).
11. **Scope: 2 phases only**. Phase 1 (Core Editor) + Phase 2 (Navigation & Manipulation). NO persistence, NO responsive class editing, NO image upload, NO Google Fonts, NO AI editing, NO sharing, NO React/Vue export.

---

## Section 11: Removed Features & Rationale

The following features have been explicitly removed from the product scope (Phases 3-4 eliminated) to focus on 2-phase MVP:

| Feature | Phase | Rationale |
|---|---|---|
| Responsive Class Editing (Feature 13) | 3 | AI prompt engine already generates responsive HTML. Manual breakpoint editing is overkill for quick-tweak use case. |
| Image Handling / Upload (Feature 14) | 3 | Users can change image src via Attribute Editor (Phase 1). Base64 bloats HTML. Deploy platforms need hosted images anyway. |
| Google Fonts Picker (Feature 15) | 3 | Brand Guidelines already define font in prompt. Code Mode sufficient for font changes. |
| AI-Assisted Editing (Feature 17) | 4 | PARKING LOT -- Potentially valuable but requires API integration + cost. Revisit after Phase 2 launch. |
| Shareable Links (Feature 18) | 4 | Requires backend. Editor is client-side only. |
| Component Templates Library (Feature 19) | 4 | Overlaps with Add Elements in Phase 2. Users can build their own templates. |
| Advanced Export React/Vue (Feature 20) | 4 | Users deploy on Scalev/Berdu/Lynk.id. Plain HTML only. |
| Composite Element Templates (in Feature 12) | 2 | Card, Hero Section, CTA Block, Navbar, Footer, Testimonial, Pricing Card, Feature Grid intentionally excluded. Users plan full sections in LP Generator module -- HTML Editor is for tweaking, not building from scratch. |

---

## Final Notes

- This spec is comprehensive and implementation-ready for a coding AI agent.
- All Phase 1 and Phase 2 features are P0 (blocking product completion).
- Removed features (Phases 3-4) are out of scope. Do not implement.
- Device preview state (mobile/tablet/desktop) stays. Responsive CLASS editing does not.
- Code snippets provided are reference implementations. Details may be refined during coding.
- No marketing language or business justification. Pure technical specification.
- Product is complete and ship-ready after Phase 2 implementation.
