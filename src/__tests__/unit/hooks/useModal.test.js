import { renderHook, act } from '@testing-library/react';
import useModal from '../../../hooks/useModal';

describe('useModal', () => {
  let onClose;

  beforeEach(() => {
    onClose = vi.fn();
    document.body.style.overflow = '';
  });

  describe('Escape key', () => {
    it('calls onClose when Escape is pressed while open', () => {
      renderHook(() => useModal(true, onClose));

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape is pressed while closed', () => {
      renderHook(() => useModal(false, onClose));

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose for non-Escape keys', () => {
      renderHook(() => useModal(true, onClose));

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('body scroll lock', () => {
    it('locks body scroll when modal is open', () => {
      renderHook(() => useModal(true, onClose));
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = renderHook(
        ({ isOpen }) => useModal(isOpen, onClose),
        { initialProps: { isOpen: true } }
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender({ isOpen: false });
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll on unmount', () => {
      const { unmount } = renderHook(() => useModal(true, onClose));
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('focus management', () => {
    it('returns focus to previously focused element on close', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      const { rerender } = renderHook(
        ({ isOpen }) => useModal(isOpen, onClose),
        { initialProps: { isOpen: true } }
      );

      // Close modal
      rerender({ isOpen: false });

      expect(document.activeElement).toBe(button);
      document.body.removeChild(button);
    });
  });

  describe('cleanup', () => {
    it('removes keydown listener on unmount', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderHook(() => useModal(true, onClose));

      unmount();

      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeSpy.mockRestore();
    });
  });
});
