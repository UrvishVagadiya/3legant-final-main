export default function AdditionalInfo({
  measurements,
  weight,
}: {
  measurements?: string;
  weight?: string;
}) {
  return (
    <div className="flex flex-col gap-4 text-[#6C7275] text-[14px] leading-5.5">
      <div>
        <p className="font-semibold text-[#141718] mb-1">Details</p>
        <p>
          You can use the removable tray for serving. The design makes it easy
          to put the tray back after use since you place it directly on the
          table frame without having to fit it into any holes.
        </p>
      </div>
      {(measurements || weight) && (
        <div>
          <p className="font-semibold text-[#141718] mb-1">Packaging</p>
          <p>
            {measurements &&
              (() => {
                const parts = measurements
                  .split("x")
                  .map((s: string) => s.trim());
                return (
                  <>
                    {parts[0] && <>Width: {parts[0]}&quot;</>}
                    {parts[1] && <> Height: {parts[1]}&quot;</>}
                    {parts[2] && <> Length: {parts[2]}&quot;</>}
                    <br />
                  </>
                );
              })()}
            {weight && (
              <>
                {`Weight: ${weight}`}
                <br />
              </>
            )}
            Package(s): 1
          </p>
        </div>
      )}
    </div>
  );
}
