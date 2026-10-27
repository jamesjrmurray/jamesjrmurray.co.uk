export interface Stat { value: string; label: string }
export interface WorkItem { org: string; years: string; title: string; outcome: string; aside?: string }
export interface Role { dates: string; title: string; org: string; note: string }
// A talk card links straight to the LinkedIn post; image is a file in public/talks/.
export interface Talk {
  event: string; date: string; dateLabel?: string;
  // A talk given more than once: each event keeps its own date and link.
  events?: { name: string; date: string; url: string }[]; title: string; quote: string; url: string;
  image: string; imageSrcset?: string; imageWidth: number; imageHeight: number; imageAlt: string; imagePosition?: string;
}
// A homepage project card; codeUrl stays unset until the public repo exists, which hides the code link.
export interface Project {
  label: string; title: string; outcome: string; tags: string[]; pageUrl: string; codeUrl?: string;
  image?: { src: string; srcset?: string; alt: string; width: number; height: number };
}
export interface Post { type: 'article' | 'talk'; title: string; summary: string; date: string; url: string; host?: string }
export interface CaseStudySection { heading: string; number?: number; paragraphs: string[]; tradeOff?: string }
export interface CaseStudy {
  // description: the search-result snippet, kept under ~155 characters (the teaser is longer).
  slug: string; title: string; org: string; role: string; years: string; teaser: string; description: string;
  highlights: Stat[]; sections: CaseStudySection[]; ndaNote: string; lesson: string;
}
