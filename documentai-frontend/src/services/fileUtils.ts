/**
 * Prepares FormData with the provided files.
 * @param {File[]} files - Array of files to be appended to FormData.
 * @returns {FormData} The FormData object containing the files.
 */

export function prepareFormData(files: any) {
    const formData = new FormData();
    
    if (files) {
      for (let file of files) {
        formData.append("files", file, file.webkitRelativePath || file.name);
      }
    }
  
    return formData;
  }