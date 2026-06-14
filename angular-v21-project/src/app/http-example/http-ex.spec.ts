import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpEx } from './http-ex';
import { Post } from './posts.service';

/*
 * ─── HttpEx Component Tests ──────────────────────────────────────────────────
 *
 * Uses Angular's HttpTestingController to intercept HTTP requests made via
 * HttpClient — no real network calls are made.
 *
 * Key pattern:
 *   1. Call the component method (e.g. component.getPosts())
 *   2. httpMock.expectOne() intercepts the in-flight request
 *   3. req.flush(mockData) resolves it synchronously
 *   4. Assert signals updated as expected
 *
 * afterEach: httpMock.verify() ensures no unexpected requests were made.
 */

const MOCK_POSTS: Post[] = [
  { userId: 1, id: 1, title: 'First Post', body: 'Body of first post.' },
  { userId: 1, id: 2, title: 'Second Post', body: 'Body of second post.' },
];

const MOCK_POST: Post = { userId: 1, id: 1, title: 'First Post', body: 'Body of first post.' };

describe('HttpEx', () => {
  let component: HttpEx;
  let fixture: ComponentFixture<HttpEx>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpEx],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HttpEx);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests remain after each test
    httpMock.verify();
  });

  // ─── Component creation ────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise all signals to their default values', () => {
    expect(component.posts()).toEqual([]);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.postId()).toBe(1);
    expect(component.singlePost()).toBeNull();
    expect(component.loadingSingle()).toBe(false);
    expect(component.newPostTitle()).toBe('');
    expect(component.newPostBody()).toBe('');
    expect(component.newPostUserId()).toBe(1);
    expect(component.createdPost()).toBeNull();
    expect(component.updateId()).toBe(1);
    expect(component.updateTitle()).toBe('');
    expect(component.updateBody()).toBe('');
    expect(component.updatedPost()).toBeNull();
    expect(component.deletePostId()).toBe(1);
    expect(component.deleteSuccess()).toBeNull();
  });

  // ─── GET all posts ─────────────────────────────────────────────────────────

  describe('getPosts()', () => {
    it('should set posts signal on success', () => {
      component.getPosts();

      // loading should be true while request is in flight
      expect(component.loading()).toBe(true);

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_POSTS);

      expect(component.posts()).toEqual(MOCK_POSTS);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should set error signal on HTTP failure', () => {
      component.getPosts();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(component.posts()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toContain('Failed to fetch posts');
    });
  });

  // ─── GET single post by ID ─────────────────────────────────────────────────

  describe('getPostById()', () => {
    it('should set singlePost signal on success', () => {
      component.getPostById();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_POST);

      expect(component.singlePost()).toEqual(MOCK_POST);
      expect(component.loadingSingle()).toBe(false);
      expect(component.errorSingle()).toBeNull();
    });

    it('should set errorSingle signal on 404', () => {
      component.getPostById();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(component.singlePost()).toBeNull();
      expect(component.loadingSingle()).toBe(false);
      expect(component.errorSingle()).toContain('Post not found');
    });

    it('should use updated postId signal when fetching', () => {
      // Simulate user typing "5" into the ID input
      const inputEvent = { target: { value: '5' } } as unknown as Event;
      component.updatePostId(inputEvent);
      expect(component.postId()).toBe(5);

      component.getPostById();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/5');
      req.flush({ ...MOCK_POST, id: 5 });

      expect(component.singlePost()?.id).toBe(5);
    });
  });

  // ─── POST — create new post ────────────────────────────────────────────────

  describe('createPost()', () => {
    beforeEach(() => {
      component.newPostTitle.set('Test Title');
      component.newPostBody.set('Test Body');
      component.newPostUserId.set(2);
    });

    it('should set createdPost signal and clear form on success', () => {
      const created: Post = { userId: 2, id: 101, title: 'Test Title', body: 'Test Body' };

      component.createPost();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userId: 2, title: 'Test Title', body: 'Test Body' });
      req.flush(created);

      expect(component.createdPost()).toEqual(created);
      expect(component.loadingPost()).toBe(false);
      // Form fields should be cleared after success
      expect(component.newPostTitle()).toBe('');
      expect(component.newPostBody()).toBe('');
      expect(component.newPostUserId()).toBe(1);
    });

    it('should not send request when title is empty', () => {
      component.newPostTitle.set('');
      component.createPost();

      httpMock.expectNone('https://jsonplaceholder.typicode.com/posts');
      expect(component.errorPost()).toBe('Title and body are required');
    });

    it('should not send request when body is empty', () => {
      component.newPostBody.set('');
      component.createPost();

      httpMock.expectNone('https://jsonplaceholder.typicode.com/posts');
      expect(component.errorPost()).toBe('Title and body are required');
    });

    it('should set errorPost signal on HTTP failure', () => {
      component.createPost();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      expect(component.createdPost()).toBeNull();
      expect(component.loadingPost()).toBe(false);
      expect(component.errorPost()).toContain('Failed to create post');
    });
  });

  // ─── PUT — update post ─────────────────────────────────────────────────────

  describe('updatePost()', () => {
    beforeEach(() => {
      component.updateId.set(3);
      component.updateTitle.set('Updated Title');
      component.updateBody.set('Updated Body');
    });

    it('should set updatedPost signal and clear form on success', () => {
      const updated: Post = { userId: 1, id: 3, title: 'Updated Title', body: 'Updated Body' };

      component.updatePost();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/3');
      expect(req.request.method).toBe('PUT');
      req.flush(updated);

      expect(component.updatedPost()).toEqual(updated);
      expect(component.loadingUpdate()).toBe(false);
      expect(component.updateTitle()).toBe('');
      expect(component.updateBody()).toBe('');
    });

    it('should not send request when title is empty', () => {
      component.updateTitle.set('');
      component.updatePost();

      httpMock.expectNone('https://jsonplaceholder.typicode.com/posts/3');
      expect(component.errorUpdate()).toBe('Title and body are required');
    });

    it('should set errorUpdate signal on HTTP failure', () => {
      component.updatePost();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/3');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(component.updatedPost()).toBeNull();
      expect(component.loadingUpdate()).toBe(false);
      expect(component.errorUpdate()).toContain('Failed to update post');
    });
  });

  // ─── DELETE ────────────────────────────────────────────────────────────────

  describe('deletePost()', () => {
    it('should set deleteSuccess signal on success', () => {
      component.deletePostId.set(4);
      component.deletePost();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/4');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(component.deleteSuccess()).toContain('Post #4 deleted successfully');
      expect(component.loadingDelete()).toBe(false);
      expect(component.errorDelete()).toBeNull();
    });

    it('should set errorDelete signal on HTTP failure', () => {
      component.deletePost();

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(component.deleteSuccess()).toBeNull();
      expect(component.loadingDelete()).toBe(false);
      expect(component.errorDelete()).toContain('Failed to delete post');
    });
  });

  // ─── Input event helpers ───────────────────────────────────────────────────

  describe('input update helpers', () => {
    const inputEvent = (value: string) =>
      ({ target: { value } }) as unknown as Event;

    it('updatePostId() should update postId signal', () => {
      component.updatePostId(inputEvent('7'));
      expect(component.postId()).toBe(7);
    });

    it('updateNewPostTitle() should update newPostTitle signal', () => {
      component.updateNewPostTitle(inputEvent('My Title'));
      expect(component.newPostTitle()).toBe('My Title');
    });

    it('updateNewPostBody() should update newPostBody signal', () => {
      component.updateNewPostBody(inputEvent('My Body'));
      expect(component.newPostBody()).toBe('My Body');
    });

    it('updateNewPostUserId() should update newPostUserId signal', () => {
      component.updateNewPostUserId(inputEvent('9'));
      expect(component.newPostUserId()).toBe(9);
    });

    it('updateUpdateId() should update updateId signal', () => {
      component.updateUpdateId(inputEvent('42'));
      expect(component.updateId()).toBe(42);
    });

    it('updateUpdateTitle() should update updateTitle signal', () => {
      component.updateUpdateTitle(inputEvent('New Title'));
      expect(component.updateTitle()).toBe('New Title');
    });

    it('updateUpdateBody() should update updateBody signal', () => {
      component.updateUpdateBody(inputEvent('New Body'));
      expect(component.updateBody()).toBe('New Body');
    });

    it('updateDeletePostId() should update deletePostId signal', () => {
      component.updateDeletePostId(inputEvent('15'));
      expect(component.deletePostId()).toBe(15);
    });
  });
});
