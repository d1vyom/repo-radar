import 'server-only';
import sanitizeHtml from 'sanitize-html';

export function sanitizeReadme(html: string, owner: string, name: string, branch: string): string {
  const repository = `${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  const ref = encodeURIComponent(branch);
  const resolve = (value: string, image = false) => {
    if (!value || value.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) return value;
    const base = image ? `https://raw.githubusercontent.com/${repository}/${ref}/` : `https://github.com/${repository}/blob/${ref}/`;
    return new URL(value, base).href;
  };
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'details', 'summary', 'del', 'kbd']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['id', 'align', 'dir'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, ...(attribs.href ? { href: resolve(attribs.href) } : {}), rel: 'noopener noreferrer' } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, ...(attribs.src ? { src: resolve(attribs.src, true) } : {}), loading: 'lazy' } }),
    },
  });
}
