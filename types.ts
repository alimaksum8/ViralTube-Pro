
export interface YouTubeContent {
  titles: string[];
  titlePercentages: number[];
  youtubeTrendingScores: number[];
  description: string;
  platformTags: string;
  metadataTags: string;
  platformScores: {
    youtube: number;
    deepseek: number;
    google: number;
    duckduckgo: number;
    tiktok: number;
    snackvideo: number;
  };
  groundingSources?: { title: string; url: string }[];
}

export enum LoadingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
