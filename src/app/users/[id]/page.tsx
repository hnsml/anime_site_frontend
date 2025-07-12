"use client";

import React, { useState, useEffect } from "react";
import { ViewStatsCard } from "@/components/profile/view-stats-card";
import ProfileBanner from "@/components/profile/profile-banner";
import ProfileCard from "@/components/profile/profile-card";
import AnimeHistory from "@/components/profile/anime-history";
import ActivityBarChart from "@/components/profile/activity-bar-chart";
import AnimeViewTimeChart from "@/components/profile/anime-view-time-chart";
import FavouritesSection from "@/components/profile/favourites-section";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col sm:gap-12">
      <ProfileBanner />
      <div className="z-1 flex flex-col gap-6 px-2 sm:gap-12 sm:px-4 md:px-6 lg:px-30">
        <h1 className="mb-0 text-[2rem] font-[500] text-white sm:hidden">
          Загальне
        </h1>
        <div className="flex flex-col gap-6 md:w-full md:flex-row md:justify-between">
          <ProfileCard isLoading={isLoading} />
          <ViewStatsCard isLoading={isLoading} />
        </div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="hidden flex-col gap-8 md:max-w-180 xl:flex">
            <h1 className="mb-0 hidden text-[2rem] font-bold text-white md:block">
              Статистика
            </h1>
            <div className="hidden flex-row gap-6 md:gap-18 xl:flex">
              <ActivityBarChart isLoading={isLoading} />
              <AnimeViewTimeChart isLoading={isLoading} />
            </div>
            <FavouritesSection isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
