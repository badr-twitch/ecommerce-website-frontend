import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Holds lightweight "what page is the user on" hints the shopping assistant
// can use to resolve references like "this product". Pages that want to
// contribute context call `setPageContext({ page, productId, productName, ... })`
// on mount and clear it on unmount.
//
// IMPORTANT: this is identifiers + names only — never product prices, stock,
// descriptions, or other facts. The backend explicitly forbids the model from
// inventing properties beyond what the knowledge guide provides.

const AssistantContext = createContext({
  pageContext: null,
  setPageContext: () => {},
  clearPageContext: () => {},
});

export const AssistantProvider = ({ children }) => {
  const [pageContext, setPageContextState] = useState(null);

  const setPageContext = useCallback((ctx) => {
    setPageContextState(ctx && typeof ctx === 'object' ? ctx : null);
  }, []);

  const clearPageContext = useCallback(() => {
    setPageContextState(null);
  }, []);

  const value = useMemo(
    () => ({ pageContext, setPageContext, clearPageContext }),
    [pageContext, setPageContext, clearPageContext]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistantContext = () => useContext(AssistantContext);

export default AssistantContext;
