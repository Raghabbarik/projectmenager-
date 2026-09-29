import { Note, Idea } from '../types';

/**
 * Open a Note in a new browser tab with deep-linking to the note viewer
 */
export const openNoteInNewTab = (note: Pick<Note, 'id' | 'title'>) => {
  const url = `${window.location.origin}${window.location.pathname}?route=note-detail&id=${encodeURIComponent(
    note.id
  )}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    alert('Please allow popups to open the note in a new tab.');
  }
};

/**
 * Open an Idea in a new browser tab with deep-linking to the idea viewer
 */
export const openIdeaInNewTab = (idea: Pick<Idea, 'id' | 'title'>) => {
  const url = `${window.location.origin}${window.location.pathname}?route=idea-detail&id=${encodeURIComponent(
    idea.id
  )}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    alert('Please allow popups to open the idea in a new tab.');
  }
};
