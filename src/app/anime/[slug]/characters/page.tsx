"use client";

import React from "react";
import Image from "next/image";
import AnimeCharactersSection from "@/components/anime-page/AnimeCharactersSection";
import AnimePosterSection from "@/components/anime-page/AnimePosterSection";
import Rating from "@/components/ui/rating";

// Мок-дані персонажів
const mainCharacters = [
  {
    slug: "kudo-hajime",
    name: "Кудо Хаджіме",
    image: "/assets/profile/mock-history-anime-card2.png",
    type: "character",
  },
  {
    slug: "kudzirai-reiko",
    name: "Куджірай Рейко",
    image: "/assets/profile/mock-history-anime-card3.png",
    type: "character",
  },
];

const secondaryCharacters = [
  {
    slug: "tao-gven",
    name: "Тао Гвен",
    image: "/assets/profile/mock-history-anime-card.png",
    type: "character",
  },
  {
    slug: "khebinuma",
    name: "Хебінума",
    image: "/assets/profile/mock-history-anime-card2.png",
    type: "character",
  },
  {
    slug: "syokhei",
    name: "Сьохей",
    image: "/assets/profile/mock-history-anime-card3.png",
    type: "character",
  },
  {
    slug: "yaomei",
    name: "Яомей",
    image: "/assets/profile/mock-history-anime-card.png",
    type: "character",
  },
  {
    slug: "yulong",
    name: "Yulong",
    image: "/assets/profile/mock-history-anime-card2.png",
    type: "character",
  },
  {
    slug: "kudzirai-b",
    name: "Куджірай Б",
    image: "/assets/profile/mock-history-anime-card3.png",
    type: "character",
  },
];

const genres = ["Романтика", "Фантастика", "Про дорослих", "Робота", "Сейнен"];

export default function CharactersAnimePage() {
  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:flex-row">
        {/* Left: Poster + кнопки */}
        <AnimePosterSection
          poster="/assets/profile/mock-history-anime-card.png"
          name="Звичайний роман у Коулуні (2025)"
          isLoading={false}
        />
        {/* Center: Інформація та персонажі */}
        <div className="flex flex-1 flex-col gap-3">
          {/* Назва, рейтинг, жанри */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-1 text-3xl leading-tight font-bold md:text-4xl">
                Звичайний роман у Коулуні (2025)
              </h1>
              <div className="mb-2 text-base text-[#A1A1AA]">
                Kowloon Generic Romance
              </div>
              <div className="mb-2 flex items-center gap-4">
                <Rating localRating={5} imdb={6.5} maxRating={10} />
              </div>
              <div className="mb-2 flex flex-wrap gap-2">
                {genres.map((g) => {
                  // Транслітерація для slug
                  const slug = g
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^a-zа-яіїєґ0-9-]/gi, "");
                  return (
                    <a
                      key={g}
                      href={`/genres/${slug}`}
                      className="mr-4 cursor-pointer border-b-2 border-dotted border-[#49638A] text-sm font-medium text-white transition-colors hover:text-[#4B7FCC]"
                    >
                      {g}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Головні персонажі */}
          <AnimeCharactersSection
            authors={mainCharacters}
            title="Головні персонажі"
            text="Персонажі поки не додані 😔"
          />
          {/* Другорядні персонажі */}
          <AnimeCharactersSection
            authors={secondaryCharacters}
            title="Другорядні персонажі"
            text="Персонажі поки не додані 😔"
          />
        </div>
      </div>
    </div>
  );
}
