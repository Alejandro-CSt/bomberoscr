import { useId } from "react";

import { Label } from "@/features/shared/components/ui/label";
import MultipleSelector, { type Option } from "@/features/shared/components/ui/multiselect";

const frameworks: Option[] = [
  {
    label: "Next.js",
    value: "next.js"
  },
  {
    label: "SvelteKit",
    value: "sveltekit"
  },
  {
    disable: true,
    label: "Nuxt.js",
    value: "nuxt.js"
  },
  {
    label: "Remix",
    value: "remix"
  },
  {
    label: "Astro",
    value: "astro"
  },
  {
    label: "Angular",
    value: "angular"
  },
  {
    label: "Vue.js",
    value: "vue"
  },
  {
    label: "React",
    value: "react"
  },
  {
    label: "Ember.js",
    value: "ember"
  },
  {
    label: "Gatsby",
    value: "gatsby"
  },
  {
    disable: true,
    label: "Eleventy",
    value: "eleventy"
  },
  {
    label: "SolidJS",
    value: "solid"
  },
  {
    label: "Preact",
    value: "preact"
  },
  {
    label: "Qwik",
    value: "qwik"
  },
  {
    label: "Alpine.js",
    value: "alpine"
  },
  {
    label: "Lit",
    value: "lit"
  }
];

export default function Component() {
  const _id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label>Multiselect</Label>
      <MultipleSelector
        commandProps={{
          label: "Select frameworks"
        }}
        defaultOptions={frameworks}
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
        hideClearAllButton
        hidePlaceholderWhenSelected
        placeholder="Select frameworks"
        value={frameworks.slice(0, 2)}
      />
      <p aria-live="polite" className="mt-2 text-muted-foreground text-xs" role="region">
        Inspired by{" "}
        <a
          className="underline hover:text-foreground"
          href="https://shadcnui-expansions.typeart.cc/docs/multiple-selector"
          rel="noreferrer noopener nofollow"
          target="_blank"
        >
          shadcn/ui expansions
        </a>
      </p>
    </div>
  );
}
