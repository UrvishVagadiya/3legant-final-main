export interface Blog {
  id: number;
  title: string;
  img: string;
  date: string; // ISO string from timestamptz
  author?: string;
  content?: string;
  category?: string;
  slug?: string;
}

export type BlogFormData = {
  title: string;
  author: string;
  date: string;
  content: string;
};

export const emptyBlogForm: BlogFormData = {
  title: "",
  author: "admin",
  date: new Date().toISOString().split("T")[0],
  content: `<h2>Introduction</h2>
<p>Write your introduction here...</p>

<HighlightBox>
  <h4>Key Insight</h4>
  <p>Provide a quick takeaway or important point here.</p>
</HighlightBox>

<h2>The Main Event</h2>
<p>Dive deep into your primary content. You can add more paragraphs as needed.</p>

<Row>
  <div>
    <h3>Sub-topic A</h3>
    <p>Details about the first sub-topic go here.</p>
  </div>
  <div>
    <h3>Sub-topic B</h3>
    <p>Details about the second sub-topic go here.</p>
  </div>
</Row>

<h2>Final Thoughts</h2>
<p>Summarize your findings and provide a call to action.</p>`,
};
