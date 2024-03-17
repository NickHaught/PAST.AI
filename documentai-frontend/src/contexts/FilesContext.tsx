// FilesContext.tsx
import { createContext, useContext, useState, FunctionComponent, ReactNode, SetStateAction, Dispatch } from 'react';

interface FilesContextType {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

// Providing an initial value directly corresponding to the expected object shape.
const FilesContext = createContext<FilesContextType>({
  files: [],
  setFiles: () => {},
});

export const useFiles = (): FilesContextType => {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error('useFiles must be used within a FilesProvider');
  }
  return context;
};

export const FilesProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
};
