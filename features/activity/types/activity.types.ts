export interface ActivityPhoto {
  id: string;
  url: string;
  sortOrder: number;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  note: string | null;
  activityDate: string;
  location: string | null;
  /** Every photo in the album. `GET /activities` sends only the first few — read `photoCount` for the real total. */
  photos: ActivityPhoto[];
  photoCount: number;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  title: string;
  description: string;
  activityDate: string;
  location?: string;
  note?: string;
}

export type UpdateActivityDto = Partial<CreateActivityDto>;

export interface ActivityQuery {
  search?: string;
  page?: number;
  limit?: number;
}
