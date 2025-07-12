"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import TopAnimeCard from "@/components/top-anime-card";
import StudioFilter from "@/components/studio-filter";

// Example filter options (should be fetched from backend in real app)
const statuses = ["Призупинено", "Онґоїнг", "Завершено", "Анонс", "Зупинено"];
const seasons = ["Зима", "Весна", "Літо", "Осінь"];
const types = ["Спешл", "Фільм", "OVA", "ONA", "TV Серіал", "Музика"];
const genres = [
  "Драма",
  "Комедія",
  "Екшн",
  "Романтика",
  "Фентезі",
  "Жахи",
  "Містика",
  "Історія",
];
const sortOptions = [
  { label: "За рейтингом", value: "rating" },
  { label: "За роком", value: "year" },
  { label: "За популярністю", value: "popularity" },
  { label: "За кількістю епізодів", value: "episodes" },
];
const ageRatings = [
  { label: "G", info: "Для всіх" },
  { label: "PG", info: "Дитяча аудиторія" },
  { label: "PG-13", info: "13+" },
  { label: "R", info: "17+" },
  { label: "R PLUS", info: "17+ (жорсткіше)" },
  { label: "R X", info: "18+" },
];
const studios: { label: string; value: string }[] = [];
const minYear = 1965;
const maxYear = new Date().getFullYear();

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/";

type FiltersState = {
  status: string[];
  season: string[];
  genres: string[];
  type: string[];
  localized: boolean;
  sort: string;
  age: string[];
  studio: string[];
  year: [number, number];
  search: string;
};

export default function AnimePage() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({
    status: [],
    season: [],
    genres: [],
    type: [],
    localized: false,
    sort: "rating",
    age: [],
    studio: [],
    year: [minYear, maxYear],
    search: "",
  });

  // Build query string for backend
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.status.length)
      params.append("status", filters.status.join(","));
    if (filters.season.length)
      params.append("season", filters.season.join(","));
    if (filters.genres.length)
      params.append("genres", filters.genres.join(","));
    if (filters.type.length) params.append("type", filters.type.join(","));
    if (filters.localized) params.append("localized", "1");
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.age.length) params.append("age", filters.age.join(","));
    if (filters.studio.length)
      params.append("studio", filters.studio.join(","));
    if (filters.year) params.append("year_from", String(filters.year[0]));
    if (filters.year) params.append("year_to", String(filters.year[1]));
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(page));
    params.append("per_page", "20");
    return params.toString();
  };

  const fetchAnimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = buildQuery();
    //TODO FILTERING IS NOT WORKING ON BACKEND
    //const url = `${API_BASE_URL}animes?${query}`;
    const url = `${API_BASE_URL}animes?`;
    console.log("Fetching:", url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHasMore((data.meta?.current_page || 1) < (data.meta?.last_page || 1));
      setAnimes(
        page === 1 ? data.data : (prev: any) => [...prev, ...data.data],
      );
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchAnimes();
    // eslint-disable-next-line
  }, [filters, page]);

  // Infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastAnimeRef = useCallback(
    (node: any) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  // StudioFilter logic (copied from studios/[slug])
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const genresRef = useRef<HTMLDivElement | null>(null);
  const handleGenresClick = useCallback(() => setGenresOpen((v) => !v), []);
  useEffect(() => {
    if (!genresOpen) return;
    const handler = (e: MouseEvent) => {
      if (genresRef.current && !genresRef.current.contains(e.target as Node))
        setGenresOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [genresOpen]);

  const [studiosOpen, setStudiosOpen] = useState(false);
  const studiosRef = useRef<HTMLDivElement | null>(null);
  const [studiosSearch, setStudiosSearch] = useState("");
  const handleStudiosClick = useCallback(() => setStudiosOpen((v) => !v), []);
  useEffect(() => {
    if (!studiosOpen) return;
    const handler = (e: MouseEvent) => {
      if (studiosRef.current && !studiosRef.current.contains(e.target as Node))
        setStudiosOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [studiosOpen]);
  const handleStudiosSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStudiosSearch(e.target.value);
    },
    [],
  );
  const filteredStudios = studios.filter((s) =>
    s.label?.toLowerCase().includes(studiosSearch.toLowerCase()),
  );

  const toggleFilter = useCallback((key: string, value: string) => {
    if (["status", "season", "genres", "type", "age"].includes(key)) {
      setFilters((prev) => {
        const arr = (prev as any)[key] as string[];
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter((v: string) => v !== value)
            : [...arr, value],
        };
      });
    }
  }, []);
  const setSingleFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const setYearRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, year: range }));
  }, []);
  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      season: [],
      genres: [],
      type: [],
      localized: false,
      sort: "rating",
      age: [],
      studio: [],
      year: [minYear, maxYear],
      search: "",
    });
  }, []);
  const handleGenresOptionClick = useCallback((g: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(g)
        ? prev.genres.filter((x) => x !== g)
        : [...prev.genres, g],
    }));
  }, []);
  const handleGenresClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFilters((prev) => ({ ...prev, genres: [] }));
  }, []);
  const handleGenresTagRemove = useCallback(
    (g: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setFilters((prev) => ({
        ...prev,
        genres: prev.genres.filter((x) => x !== g),
      }));
    },
    [],
  );
  const handleStudiosOptionClick = useCallback((val: string) => {
    setFilters((prev) => ({
      ...prev,
      studio: prev.studio.includes(val)
        ? prev.studio.filter((x) => x !== val)
        : [...prev.studio, val],
    }));
  }, []);
  const handleStudiosClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFilters((prev) => ({ ...prev, studio: [] }));
  }, []);
  const handleStudiosTagRemove = useCallback(
    (val: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setFilters((prev) => ({
        ...prev,
        studio: prev.studio.filter((x) => x !== val),
      }));
    },
    [],
  );

  return (
    <div className="flex min-h-screen w-full flex-col gap-10 px-4 pt-10 pb-20 sm:px-8 sm:pt-6 sm:pb-8 md:flex-row md:pt-8 md:pb-14">
      {/* Main content */}
      <div className="min-w-0 flex-1 text-white">
        {/* Title and search/filter area styled like studios/[slug] */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Аніме</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="anime-search"
              className="mb-1 min-w-[80px] text-base font-semibold text-white sm:mr-2 sm:mb-0"
            >
              Назва
            </label>
            <input
              id="anime-search"
              type="text"
              placeholder="Введіть назву аніме..."
              className="w-full max-w-md rounded-lg border border-[#232B39] bg-[#181F2A] px-4 py-2 text-white placeholder-gray-400 transition-colors duration-150 focus:border-blue-400 focus:outline-none"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
            />
          </div>
        </div>
        {error && <div className="text-center text-red-500">{error}</div>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
  {animes.map((anime: any, idx: number) => (
    <Link key={anime.id || idx} href={`/anime/${anime.slug}`} passHref>
      
        <TopAnimeCard
          image={anime.poster || anime.poster_url || ""}
          title={anime.name || anime.title || ""}
          cardClassName="min-w-0 w-auto"
          year={
            anime.year ||
            (anime.first_air_date
              ? Number(anime.first_air_date.slice(0, 4))
              : 0)
          }
          type={anime.kind || "-"}
          rank={anime.rank || idx + 1}
          rating={anime.imdb_score ?? 0}
        />
      
    </Link>
  ))}
</div>
        {loading && (
          <div className="text-center text-white">Завантаження...</div>
        )}
        <div ref={lastAnimeRef} />
      </div>
      {/* Sidebar filters */}
      <aside
        className="hidden w-72 flex-shrink-0 md:block"
        style={{ minWidth: 0, maxWidth: "100vw" }}
      >
        <StudioFilter
          filters={filters}
          toggleFilter={toggleFilter as any}
          setSingleFilter={setSingleFilter as any}
          setYearRange={setYearRange}
          clearFilters={clearFilters}
          genres={genres}
          genresOpen={genresOpen}
          genresRef={genresRef}
          handleGenresClick={handleGenresClick}
          handleGenresOptionClick={handleGenresOptionClick}
          handleGenresClear={handleGenresClear}
          handleGenresTagRemove={handleGenresTagRemove}
          types={types}
          statuses={statuses}
          seasons={seasons}
          ageRatings={ageRatings}
          // studios={studios}
          // studiosOpen={studiosOpen}
          // studiosRef={studiosRef}
          // studiosSearch={studiosSearch}
          // handleStudiosClick={handleStudiosClick}
          // handleStudiosSearch={handleStudiosSearch}
          // filteredStudios={filteredStudios}
          // handleStudiosOptionClick={handleStudiosOptionClick}
          // handleStudiosClear={handleStudiosClear}
          // handleStudiosTagRemove={handleStudiosTagRemove}
          minYear={minYear}
          maxYear={maxYear}
          isMobile={false}
        />
      </aside>
    </div>
  );
}
