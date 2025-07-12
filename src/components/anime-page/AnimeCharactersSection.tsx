import React from "react";
import CardCollection from "@/components/main-page/card-collection";
import AuthorCardComponent from "../author-card";

interface Person {
  slug: string;
  name: string;
  image?: string;
  birthday?: string | null;
  age?: number | null;
  type: string; // "character" або інші
}
interface AnimeCharactersSectionProps {
  authors?: Person[];
  title: string;
  text: string;
}

const AnimeCharactersSection: React.FC<AnimeCharactersSectionProps> = ({
  authors,
  title,
  text,
}) => {
  if (!authors || authors.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl">
        <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>
        <div className="text-[#888]">{text}</div>
      </section>
    );
  }
  const enrichedAuthors = authors.map((author) => ({
    ...author,
    link:
      title === "Головні персонажі"
        ? `/characters/${author.slug}`
        : `/authors/${author.slug}`,
  }));
  return (
    <section className="mx-auto w-full max-w-2xl">
      <CardCollection
        items={enrichedAuthors}
        cardType="author"
        title={title}
        showButton={false}
      />
    </section>
  );
};

export default AnimeCharactersSection;
