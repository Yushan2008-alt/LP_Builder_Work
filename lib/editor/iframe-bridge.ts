// ============================================================================
// Iframe Bridge — postMessage protocol types + script template
// ============================================================================

export interface ElementSelectedMessage {
  type: "element-selected";
  path: string;
  tag: string;
  classes: string[];
  text: string;
  attrs: Record<string, string>;
}

export interface SelectElementMessage {
  type: "select-element";
  path: string;
}

export interface DeselectElementMessage {
  type: "deselect-element";
}

export type IframeIncomingMessage = ElementSelectedMessage;
export type IframeOutgoingMessage = SelectElementMessage | DeselectElementMessage;

/**
 * The bridge script string to inject into the iframe srcDoc.
 * Handles: path assignment, click/hover, postMessage send/receive.
 */
export const IFRAME_BRIDGE_SCRIPT = `
(function() {
  var selectedPath = null;

  function assignPaths(el, path) {
    el.setAttribute('data-editor-path', path);
    var childIndex = 0;
    var children = el.children;
    for (var i = 0; i < children.length; i++) {
      assignPaths(children[i], path ? path + '>' + childIndex : String(childIndex));
      childIndex++;
    }
  }

  function getDirectText(el) {
    var text = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      if (node.nodeType === 3) text += node.textContent;
    }
    return text;
  }

  function getAttrs(el) {
    var attrs = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      if (!attr.name.startsWith('data-editor-') && attr.name !== 'class') {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
  }

  function clearSelection() {
    if (selectedPath !== null) {
      var prev = document.querySelector('[data-editor-path="' + selectedPath + '"]');
      if (prev) {
        prev.style.outline = '';
        prev.style.outlineOffset = '';
        prev.style.backgroundColor = '';
      }
    }
    selectedPath = null;
  }

  function applySelection(path) {
    clearSelection();
    selectedPath = path;
    var el = document.querySelector('[data-editor-path="' + path + '"]');
    if (el) {
      el.style.outline = '2px solid #3b82f6';
      el.style.outlineOffset = '-2px';
      el.style.backgroundColor = 'rgba(59,130,246,0.08)';
    }
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    var el = event.target.closest('[data-editor-path]');
    if (!el) return;
    var path = el.getAttribute('data-editor-path');
    var tag = el.tagName.toLowerCase();
    var classes = Array.from(el.classList);
    var text = getDirectText(el);
    var attrs = getAttrs(el);
    window.parent.postMessage({
      type: 'element-selected',
      path: path,
      tag: tag,
      classes: classes,
      text: text,
      attrs: attrs
    }, '*');
    applySelection(path);
  }

  var hoverEl = null;
  function handleMouseOver(event) {
    var el = event.target.closest('[data-editor-path]');
    if (el && el.getAttribute('data-editor-path') !== selectedPath) {
      if (hoverEl && hoverEl !== el) {
        hoverEl.style.outline = '';
      }
      el.style.outline = '2px dashed #93c5fd';
      el.style.outlineOffset = '-2px';
      hoverEl = el;
    }
  }

  function handleMouseOut(event) {
    var el = event.target.closest('[data-editor-path]');
    if (el && el.getAttribute('data-editor-path') !== selectedPath) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }
  }

  window.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;
    if (event.data.type === 'select-element') {
      applySelection(event.data.path);
    }
    if (event.data.type === 'deselect-element') {
      clearSelection();
    }
  });

  function init() {
    assignPaths(document.documentElement, '');
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
