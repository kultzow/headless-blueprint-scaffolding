import Image from 'next/image'

export function PreviewCard({ src, onLoad, refreshSignal }: { src: string; onLoad: () => void; refreshSignal?: number }) {
  return (
    <div className="preview-card">
      <div className="preview-wrapper">
        <div className="card-container">
          <Image
            src={`${src}?t=${refreshSignal ?? 0}`}
            alt="image-preview"
            width={782}
            height={1076}
            unoptimized
            loading="eager"
            onLoad={onLoad}
          />
        </div>
      </div>
    </div>
  );
}
