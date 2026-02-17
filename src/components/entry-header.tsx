type EntryHeaderProps = {
  title: string;
  date?: Date | string;
  author?: string;
  /** SEO: sahifa sarlavhasi uchun h1 (bitta h1 sahifada) */
  headingLevel?: 'h1' | 'h2';
};

export default function EntryHeader({ title, date, author, headingLevel = 'h2' }: EntryHeaderProps) {
  const Heading = headingLevel;
  return (
    <div className="text-center mb-10">
      {title && <Heading className="text-3xl xl:text-4xl">{title}</Heading>}

      {date && author && (
        <div className="text-sm mt-5">
          By {author} on <time>{new Date(date).toDateString()}</time>
        </div>
      )}
    </div>
  );
}
