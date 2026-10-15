export interface LibraryBook {
  id: string;
  bookId: string;
  isbn?: string;
  title: string;
  titleNepali?: string; // fallback alias
  titleEnglish?: string;
  author: string;
  publisher?: string;
  publicationYear?: string;
  edition?: string;
  language: string;
  category: string;
  subject?: string;
  mediaType: 'physical' | 'ebook' | 'audiobook' | 'videobook' | string;
  totalCopies: number;
  availableCopies: number;
  rackNo?: string;
  shelfNo?: string;
  physicalLocation?: string;
  isAvailablePhysical?: boolean;
  borrowStatus?: string;
  pages?: number;
  coverUrl?: string;
  digitalFileUrl?: string; // PDF link or uploaded file
  audioUrl?: string;
  audioDuration?: string;
  narrator?: string;
  audioFormat?: string;
  videoUrl?: string;
  videoDuration?: string;
  videoPresenter?: string;
  videoQuality?: string;
  copyrightStatus?: string;
  summary?: string;
  keywords?: string;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle?: string;
  borrowerName: string;
  borrowerCitizenId?: string;
  borrowerType?: string;
  borrowerContact?: string;
  borrowerCardNo?: string;
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue' | string;
  fineAmount?: number;
  remarks?: string;
  createdAt?: string;
  book?: LibraryBook;
}

export interface LibraryStats {
  total: number;
  physical: number;
  ebook: number;
  audiobook: number;
  videobook: number;
  borrowed: number;
  totalTitles?: number;
  totalAudiobooks?: number;
  totalVideobooks?: number;
  activeBorrows?: number;
  registeredMembers?: number;
}
