export interface Blog {
  id: number;
  title: string;
  img: string;
  date: string;
  content?: string;
  author?: string;
  category?: string;
  slug?: string;
  intro?: string;
  sections?: BlogSection[];
}

export interface BlogSection {
  id: string;
  type: "section";
  title?: string;
  content?: string;
  image?: string;
  title1?: string;
  content1?: string;
  title2?: string;
  content2?: string;
  image2?: string;
  imageFile?: File;
}

export type BlogFormData = {
  title: string;
  img: string;
  author: string;
  date: string;
  featured: boolean;
  intro: string;
  sections: BlogSection[];
};

export const emptyBlogForm: BlogFormData = {
  title: "",
  img: "",
  author: "admin",
  date: new Date().toISOString().split("T")[0],
  featured: false,
  intro: "",
  sections: [
    {
      id: "section-1",
      type: "section",
      title: "",
      content: "",
    },
    {
      id: "section-2",
      type: "section",
      title: "",
      content: "",
    },
    {
      id: "section-3",
      type: "section",
      title: "",
      content: "",
      image: "",
      image2: "",
    },
    {
      id: "section-4",
      type: "section",
      title1: "",
      content1: "",
      title2: "",
      content2: "",
      image: "",
    },
  ],
};
