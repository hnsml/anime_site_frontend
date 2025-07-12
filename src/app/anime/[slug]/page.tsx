"use client";

import { API_BASE_URL } from "@/config";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommentCard from "@/components/main-page/CommentSection/comment-card";
import ReviewCard from "@/components/main-page/ReviewSection/review-card";
import AnimeCommentCard from "@/components/main-page/CommentSection/anime-comment-card";
import AnimeCommentSection from "@/components/main-page/CommentSection/anime-comment-section";
import AnimePosterSection from "@/components/anime-page/AnimePosterSection";
import AnimeMainInfoSection from "@/components/anime-page/AnimeMainInfoSection";
import AnimeEpisodesSection from "@/components/anime-page/AnimeEpisodesSection";
import AnimeReviewsSection from "@/components/anime-page/AnimeReviewsSection";
import { SkeletonTheme } from "react-loading-skeleton";
import AnimeCharactersSection from "@/components/anime-page/AnimeCharactersSection";
import AnimeDetailsPanel from "@/components/shared/anime-details-panel";

interface Studio {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

interface Seo {
  title: string;
  description: string;
  image: string;
}

interface Person {
  slug: string;
  name: string;
  image?: string;
  birthday?: string | null;
  age?: number | null;
  type: string; // "character" або інші
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Comment {
  id: string;
  user: User;
  body: string;
  created_at: string;
  likes?: number;
  dislikes?: number;
  replies?: Comment[];
}

interface Rating {
  id: string;
  user: User;
  review?: string;
  number: number;
  created_at: string; // ISO string
}

interface Episode {
  id: string;
  name: string;
  number: number;
  pictures?: string | string[] | null;
  air_date?: string | null;
  duration?: number;
}

interface People {
  characters: Person[];
  authors: Person[];
}

interface AnimeDetails {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_name?: string;
  poster: string;
  duration?: number;
  episodes_count?: number;
  first_air_date?: string;
  last_air_date?: string;
  imdb_score?: number;
  is_published?: boolean;
  kind?: string;
  studio?: Studio;
  seo?: Seo;
  episodes: Episode[];
  ratings?: Rating[];
  comments?: Comment[];
  people: {
    characters?: Person[];
    authors?: Person[];
  };
  tags?: string[]; // або окремий інтерфейс для тегів, якщо є деталі
  created_at?: string;
  updated_at?: string;
}



export default function AnimePage() {
  const params = useParams();

  // Безпечний варіант отримати slug — якщо params чи slug немає, slug буде пустим рядком
  const slug = typeof params === "object" && params !== null && "slug" in params
    ? (Array.isArray(params.slug) ? params.slug[0] : params.slug)
    : "";

  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAnimeData(slug: string) {
    setIsLoading(true);
    try {
      if (!slug) {
        setAnime(null);
        setTags([]);
        setIsLoading(false);
        return;
      }

      const [animeRes, tagsRes] = await Promise.all([
        fetch(`${API_BASE_URL}animes/${slug}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}animes/${slug}/tags`, { cache: "no-store" }),
      ]);

      if (!animeRes.ok) {
        setAnime(null);
        setTags([]);
        setIsLoading(false);
        return;
      }

      const animeJson = await animeRes.json();
      const tagsJson = await tagsRes.json();

      setAnime(animeJson.data);
      setTags(tagsJson.data || []);
      
    } catch (error) {
      console.error("Error loading anime data:", error);
      setAnime(null);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (slug) {
      fetchAnimeData(slug);
    }
  }, [slug]);

  if (isLoading) {
    return <div className="text-white text-center mt-20">Завантаження...</div>;
  }

  if (!anime) {
    return <div className="text-white text-center mt-20">Аніме не знайдено</div>;
  }
 
  return (
    <SkeletonTheme
    baseColor="#23242A"
    highlightColor="#44454A"
    borderRadius={8}
    duration={1.2}
  >
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:flex-row">
      {/* Left: Poster */}
      <AnimePosterSection
        poster={anime.poster}
        name={anime.name}
        isLoading={isLoading}
      />

      {/* Center: Main info */}
      <div className="flex flex-1 flex-col gap-4">
        <AnimeMainInfoSection
          anime={anime}
          tags={tags}
          description={anime.description}
          isLoading={isLoading}
        />
        <AnimeEpisodesSection
          animeTitle={anime.name}
          episodes={anime.episodes}
          isLoading={isLoading}
        />
        <AnimeCharactersSection
          authors={anime.people.characters ?? []}
          title="Головні персонажі"
          text = "Персонажі поки не додані 😔"
        />
        <AnimeCharactersSection authors={anime.people.authors} title="Автори"  text = "Автори поки не додані 😔"/>
        <AnimeReviewsSection
          reviews={anime.ratings}
          animeName={anime.name}
          isLoading={isLoading}
        />
        <AnimeCommentSection comments={anime.comments} isLoading={isLoading} />
      </div>

      {/* Right: Details panel (only visible on large screens) */}
      <div className="hidden min-w-[260px] flex-col items-end gap-6 lg:flex">
        {isLoading ? (
          <AnimeDetailsPanel anime={anime} isLoading />
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2">
              {/* <span className="text-3xl font-bold text-white">
                {anime.localRating}
              </span> */}
              {/* <Star className="h-6 w-6 text-white" fill="white" /> */}
            </div>
            <AnimeDetailsPanel anime={anime} />
          </>
        )}
      </div>
    </div>
  </SkeletonTheme>
  );
}
