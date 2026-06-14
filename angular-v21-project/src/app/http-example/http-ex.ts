import { Component, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Post, PostsService } from './posts.service';

/*
 * ─── HTTP CRUD with HttpClient + Signals ────────────────────────────────────
 *
 * Pattern: service method returns Observable<T> → component subscribes → signal updated.
 * Signals drive the template reactively — no manual change detection needed.
 *
 * Why subscribe() instead of toSignal()?
 *   toSignal() works great for simple reads, but subscribe() + full Observer object
 *   { next, error, complete } gives explicit control over loading/error state per request —
 *   essential for CRUD where each operation has its own loading/error lifecycle.
 *
 * HttpClient observables:
 *   • Are COLD — each subscribe() triggers a new HTTP request.
 *   • Complete automatically after one emission (no unsubscribe needed for single requests).
 *   • Emit asynchronously — the callback runs AFTER the current call stack, when the
 *     HTTP response arrives. This is why loading signals exist.
 *
 * JSONPlaceholder note:
 *   POST/PUT/DELETE calls succeed and return valid responses, but the API is read-only —
 *   changes are NOT persisted. IDs returned by POST are always 101.
 */

@Component({
  selector: 'app-http-ex',
  imports: [TitleCasePipe],
  templateUrl: './http-ex.html',
  styleUrl: './http-ex.scss',
})
export class HttpEx {
  private readonly postsService = inject(PostsService);

  // ─── GET all posts ──────────────────────────────────────────────────────────
  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.postsService.getPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to fetch posts: ' + err.message);
        this.loading.set(false);
        console.error('Error fetching posts:', err);
      },
    });
  }

  // ─── GET single post by ID ─────────────────────────────────────────────────
  postId = signal<number>(1);
  singlePost = signal<Post | null>(null);
  loadingSingle = signal<boolean>(false);
  errorSingle = signal<string | null>(null);

  updatePostId(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.postId.set(Number(value));
  }

  getPostById(): void {
    this.loadingSingle.set(true);
    this.errorSingle.set(null);
    this.singlePost.set(null);

    this.postsService.getPostById(this.postId()).subscribe({
      next: (data) => {
        this.singlePost.set(data);
        this.loadingSingle.set(false);
      },
      error: (err) => {
        this.errorSingle.set('Post not found: ' + err.message);
        this.loadingSingle.set(false);
        console.error('Error fetching post by ID:', err);
      },
    });
  }

  // ─── POST — create new post ────────────────────────────────────────────────
  newPostTitle = signal<string>('');
  newPostBody = signal<string>('');
  newPostUserId = signal<number>(1);
  loadingPost = signal<boolean>(false);
  errorPost = signal<string | null>(null);
  createdPost = signal<Post | null>(null);

  updateNewPostTitle(event: Event): void {
    this.newPostTitle.set((event.target as HTMLInputElement).value);
  }

  updateNewPostBody(event: Event): void {
    this.newPostBody.set((event.target as HTMLTextAreaElement).value);
  }

  updateNewPostUserId(event: Event): void {
    this.newPostUserId.set(Number((event.target as HTMLInputElement).value));
  }

  createPost(): void {
    if (!this.newPostTitle() || !this.newPostBody()) {
      this.errorPost.set('Title and body are required');
      return;
    }

    this.loadingPost.set(true);
    this.errorPost.set(null);
    this.createdPost.set(null);

    const newPost: Post = {
      userId: this.newPostUserId(),
      title: this.newPostTitle(),
      body: this.newPostBody(),
    };

    this.postsService.createPost(newPost).subscribe({
      next: (data) => {
        this.createdPost.set(data);
        this.loadingPost.set(false);
        // Clear form
        this.newPostTitle.set('');
        this.newPostBody.set('');
        this.newPostUserId.set(1);
      },
      error: (err) => {
        this.errorPost.set('Failed to create post: ' + err.message);
        this.loadingPost.set(false);
        console.error('Error creating post:', err);
      },
    });
  }

  // ─── PUT — update existing post ────────────────────────────────────────────
  updateId = signal<number>(1);
  updateTitle = signal<string>('');
  updateBody = signal<string>('');
  loadingUpdate = signal<boolean>(false);
  errorUpdate = signal<string | null>(null);
  updatedPost = signal<Post | null>(null);

  updateUpdateId(event: Event): void {
    this.updateId.set(Number((event.target as HTMLInputElement).value));
  }

  updateUpdateTitle(event: Event): void {
    this.updateTitle.set((event.target as HTMLInputElement).value);
  }

  updateUpdateBody(event: Event): void {
    this.updateBody.set((event.target as HTMLTextAreaElement).value);
  }

  updatePost(): void {
    if (!this.updateTitle() || !this.updateBody()) {
      this.errorUpdate.set('Title and body are required');
      return;
    }

    this.loadingUpdate.set(true);
    this.errorUpdate.set(null);
    this.updatedPost.set(null);

    const post: Post = {
      userId: 1,
      title: this.updateTitle(),
      body: this.updateBody(),
    };

    this.postsService.updatePost(this.updateId(), post).subscribe({
      next: (data) => {
        this.updatedPost.set(data);
        this.loadingUpdate.set(false);
        this.updateTitle.set('');
        this.updateBody.set('');
      },
      error: (err) => {
        this.errorUpdate.set('Failed to update post: ' + err.message);
        this.loadingUpdate.set(false);
        console.error('Error updating post:', err);
      },
    });
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  deletePostId = signal<number>(1);
  loadingDelete = signal<boolean>(false);
  errorDelete = signal<string | null>(null);
  deleteSuccess = signal<string | null>(null);

  updateDeletePostId(event: Event): void {
    this.deletePostId.set(Number((event.target as HTMLInputElement).value));
  }

  deletePost(): void {
    this.loadingDelete.set(true);
    this.errorDelete.set(null);
    this.deleteSuccess.set(null);

    this.postsService.deletePost(this.deletePostId()).subscribe({
      next: () => {
        this.deleteSuccess.set(`Post #${this.deletePostId()} deleted successfully.`);
        this.loadingDelete.set(false);
      },
      error: (err) => {
        this.errorDelete.set('Failed to delete post: ' + err.message);
        this.loadingDelete.set(false);
        console.error('Error deleting post:', err);
      },
    });
  }
}
