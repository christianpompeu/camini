export type RadarStatus =
  | "candidate"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export interface RadarSnapshotNotion {
  pageId: string;
  url: string;
  lastEditedAt?: string | null;
}

export interface RadarSnapshotEditorial {
  markdown: string;
}

export interface RadarSnapshot {
  schemaVersion: number;
  source: "notion";
  notion: RadarSnapshotNotion;
  editorial: RadarSnapshotEditorial;
  legacy?: unknown | null;
}

export interface RadarHeroImage {
  alt?: string;
  src?: string;
  caption?: string;
  emailSrc?: string;
}

export interface RadarEdition {
  id: string;
  notion_page_id?: string | null;
  notion_url?: string | null;
  identificador: string;
  numero: number;
  slug: string;
  status: RadarStatus;
  is_test: boolean;
  titulo: string;
  subtitulo?: string | null;
  resumo?: string | null;
  period_label?: string | null;
  reading_minutes?: number | null;
  tags?: string[] | null;
  hero_image?: RadarHeroImage | null;
  edition_at?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  snapshot?: RadarSnapshot | null;
  snapshot_version?: number | null;
  content_hash?: string | null;
  synced_at?: string | null;
  notion_last_edited_at?: string | null;
  created_at: string;
  updated_at: string;
}
