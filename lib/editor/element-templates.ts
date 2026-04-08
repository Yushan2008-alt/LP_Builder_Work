export interface ElementTemplate {
  id: string;
  label: string;
  html: string;
}

export const ELEMENT_TEMPLATES: Record<string, ElementTemplate[]> = {
  BASIC: [
    { id: "div", label: "Div", html: '<div class="p-4">New div</div>' },
    { id: "section", label: "Section", html: '<section class="py-12 px-4">New section</section>' },
    { id: "h1", label: "Heading H1", html: '<h1 class="text-4xl font-bold">Heading</h1>' },
    { id: "h2", label: "Heading H2", html: '<h2 class="text-3xl font-semibold">Heading</h2>' },
    { id: "h3", label: "Heading H3", html: '<h3 class="text-2xl font-semibold">Heading</h3>' },
    { id: "p", label: "Paragraph", html: '<p class="text-base text-gray-700">Paragraph text</p>' },
    { id: "span", label: "Span", html: "<span>Inline text</span>" },
  ],
  INTERACTIVE: [
    {
      id: "button",
      label: "Button",
      html: '<button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Button</button>',
    },
    {
      id: "link",
      label: "Link",
      html: '<a href="#" class="text-blue-600 hover:underline">Link text</a>',
    },
    {
      id: "input",
      label: "Input",
      html: '<input type="text" class="border rounded-lg px-4 py-2 w-full" placeholder="Enter text..." />',
    },
    {
      id: "textarea",
      label: "Textarea",
      html: '<textarea class="border rounded-lg px-4 py-2 w-full" rows="4" placeholder="Enter text..."></textarea>',
    },
  ],
  MEDIA: [
    {
      id: "img",
      label: "Image",
      html: '<img src="https://placehold.co/600x400" alt="Placeholder" class="w-full rounded-lg" />',
    },
    {
      id: "video",
      label: "Video",
      html: '<video controls class="w-full rounded-lg"><source src="" type="video/mp4" /></video>',
    },
  ],
  LAYOUT: [
    {
      id: "flex-row",
      label: "Flex Row",
      html: '<div class="flex gap-4"><div class="flex-1 p-4 border rounded">Item 1</div><div class="flex-1 p-4 border rounded">Item 2</div></div>',
    },
    {
      id: "flex-col",
      label: "Flex Column",
      html: '<div class="flex flex-col gap-4"><div class="p-4 border rounded">Item 1</div><div class="p-4 border rounded">Item 2</div></div>',
    },
    {
      id: "grid-2",
      label: "Grid 2-col",
      html: '<div class="grid grid-cols-2 gap-4"><div class="p-4 border rounded">Item 1</div><div class="p-4 border rounded">Item 2</div></div>',
    },
    {
      id: "grid-3",
      label: "Grid 3-col",
      html: '<div class="grid grid-cols-3 gap-4"><div class="p-4 border rounded">Item 1</div><div class="p-4 border rounded">Item 2</div><div class="p-4 border rounded">Item 3</div></div>',
    },
  ],
};
