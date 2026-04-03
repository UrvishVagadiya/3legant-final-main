"use client";
import React, { ChangeEvent } from "react";
import { BlogFormData, BlogSection } from "@/types/blog";

const Input = ({
  label,
  required,
  ...props
}: {
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
      {label}
      {required && " *"}
    </label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
    />
  </div>
);

const Textarea = ({
  label,
  required,
  rows = 4,
  ...props
}: {
  label: string;
  required?: boolean;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div>
    <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
      {label}
      {required && " *"}
    </label>
    <textarea
      rows={rows}
      {...props}
      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718] resize-none"
    />
  </div>
);

interface Props {
  formData: BlogFormData;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
  editingId: number | null;
  imageFile?: File | null;
  onImageChange?: (file: File | null) => void;
}

export default function BlogFormFields({
  formData,
  setFormData,
  editingId,
}: Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((p: BlogFormData) => ({
      ...p,
      [name]: value,
    }));
  };

  const updateSection = (
    sectionId: string,
    field: keyof BlogSection,
    value: string,
  ) => {
    setFormData((p: BlogFormData) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s,
      ),
    }));
  };

  return (
    <>
      {/* Blog Header Image URL */}
      <Input
        label="Blog Header Image URL *"
        name="img"
        type="url"
        value={formData.img}
        onChange={handleChange}
        placeholder="https://example.com/image.jpg"
        required
      />

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Blog Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., How to make a busy bathroom a place to relax"
        />
        <Input
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Publication Date"
        name="date"
        type="date"
        value={formData.date ? formData.date.split("T")[0] : ""}
        onChange={handleChange}
        required
      />

      {/* Introduction */}
      <Textarea
        label="Introduction Paragraph"
        value={formData.intro}
        onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
        rows={3}
        placeholder="Your bathroom serves a string of busy functions on a daily basis..."
      />

      {/* Section 1: Heading + Paragraph */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-sm font-semibold text-[#141718] mb-4 uppercase">
          Section 1: Heading & Paragraph
        </h3>
        <div className="space-y-4">
          <Input
            label="Section 1 Heading"
            value={formData.sections[0]?.title || ""}
            onChange={(e) =>
              updateSection(formData.sections[0]?.id, "title", e.target.value)
            }
            placeholder="e.g., A cleaning hub with built-in ventilation"
          />
          <Textarea
            label="Section 1 Paragraph"
            value={formData.sections[0]?.content || ""}
            onChange={(e) =>
              updateSection(formData.sections[0]?.id, "content", e.target.value)
            }
            rows={4}
            placeholder="Use a wall-mounted shower system to create a handy cleaning post..."
          />
        </div>
      </div>

      {/* Section 2: Heading + Paragraph */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-sm font-semibold text-[#141718] mb-4 uppercase">
          Section 2: Heading & Paragraph
        </h3>
        <div className="space-y-4">
          <Input
            label="Section 2 Heading"
            value={formData.sections[1]?.title || ""}
            onChange={(e) =>
              updateSection(formData.sections[1]?.id, "title", e.target.value)
            }
            placeholder="e.g., Storage with a calming effect"
          />
          <Textarea
            label="Section 2 Paragraph"
            value={formData.sections[1]?.content || ""}
            onChange={(e) =>
              updateSection(formData.sections[1]?.id, "content", e.target.value)
            }
            rows={4}
            placeholder="Having a lot to store doesn't mean it all has to go in a cupboard..."
          />
        </div>
      </div>

      {/* Section 3: Heading + Paragraph + 2 Images */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-sm font-semibold text-[#141718] mb-4 uppercase">
          Section 3: Heading & Paragraph with Images
        </h3>
        <div className="space-y-4">
          <Input
            label="Section 3 Heading"
            value={formData.sections[2]?.title || ""}
            onChange={(e) =>
              updateSection(formData.sections[2]?.id, "title", e.target.value)
            }
            placeholder="e.g., Kit your clutter for easy access"
          />
          <Textarea
            label="Section 3 Paragraph"
            value={formData.sections[2]?.content || ""}
            onChange={(e) =>
              updateSection(formData.sections[2]?.id, "content", e.target.value)
            }
            rows={4}
            placeholder="Even if you have a cabinet ready to swallow the clutter..."
          />

          {/* 2 Images Side by Side - URLs */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Input
              label="Image 1 URL (Left)"
              type="url"
              value={formData.sections[2]?.image || ""}
              onChange={(e) =>
                updateSection(formData.sections[2]?.id, "image", e.target.value)
              }
              placeholder="https://example.com/image1.jpg"
            />
            <Input
              label="Image 2 URL (Right)"
              type="url"
              value={formData.sections[2]?.image2 || ""}
              onChange={(e) =>
                updateSection(
                  formData.sections[2]?.id,
                  "image2",
                  e.target.value,
                )
              }
              placeholder="https://example.com/image2.jpg"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Image + 2 Text Blocks */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-sm font-semibold text-[#141718] mb-4 uppercase">
          Section 4: Image with Text Blocks
        </h3>
        <div className="space-y-4">
          {/* Featured Image - URL */}
          <Input
            label="Featured Image URL"
            type="url"
            value={formData.sections[3]?.image || ""}
            onChange={(e) =>
              updateSection(formData.sections[3]?.id, "image", e.target.value)
            }
            placeholder="https://example.com/featured-image.jpg"
          />

          {/* Text Block 1 */}
          <div>
            <Input
              label="Text Block 1 - Title"
              value={formData.sections[3]?.title1 || ""}
              onChange={(e) =>
                updateSection(
                  formData.sections[3]?.id,
                  "title1",
                  e.target.value,
                )
              }
              placeholder="e.g., An ecosystem of towels"
            />
            <Textarea
              label="Text Block 1 - Description"
              value={formData.sections[3]?.content1 || ""}
              onChange={(e) =>
                updateSection(
                  formData.sections[3]?.id,
                  "content1",
                  e.target.value,
                )
              }
              rows={3}
              placeholder="Racks or hooks that allow air to circulate..."
            />
          </div>

          {/* Text Block 2 */}
          <div className="pt-4 border-t">
            <Input
              label="Text Block 2 - Title"
              value={formData.sections[3]?.title2 || ""}
              onChange={(e) =>
                updateSection(
                  formData.sections[3]?.id,
                  "title2",
                  e.target.value,
                )
              }
              placeholder="e.g., Make your mop disappear"
            />
            <Textarea
              label="Text Block 2 - Description"
              value={formData.sections[3]?.content2 || ""}
              onChange={(e) =>
                updateSection(
                  formData.sections[3]?.id,
                  "content2",
                  e.target.value,
                )
              }
              rows={3}
              placeholder="Having your cleaning tools organized makes them easier..."
            />
          </div>
        </div>
      </div>
    </>
  );
}
