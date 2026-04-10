import Image, { ImageProps } from "next/image";

type Props = ImageProps & {
  colorHex?: string | null;
  tintOpacity?: number;
};

export default function TintedProductImage({
  colorHex,
  tintOpacity = 0.5,
  ...imageProps
}: Props) {
  return (
    <div className="relative w-full h-full">
      <Image {...imageProps} />
      {colorHex && (
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-300"
          style={{
            backgroundColor: colorHex,
            opacity: tintOpacity,
            mixBlendMode: "color",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
