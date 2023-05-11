export const readFile = (file: File | string): Promise<string | null> => {
  if (file instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (_event) => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }
  if (typeof file === 'string') {
    return Promise.resolve(file);
  }
  return Promise.resolve(null);
};

export const calcDims = (width: number, height: number, externalMaxWidth?: number, externalMaxHeight?: number) => {
  const ratio = width / height;

  const maxWidth = externalMaxWidth || window.innerWidth;
  const maxHeight = externalMaxHeight || window.innerHeight;
  const calculated = {
    width: maxWidth,
    height: Math.round(maxWidth / ratio),
    ratio,
  };

  if (calculated.height > maxHeight) {
    calculated.height = maxHeight;
    calculated.width = Math.round(maxHeight * ratio);
  }
  return calculated;
};

export function isCrossOriginURL(url: string) {
  const { location } = window;
  const parts = url.match(/^(\w+:)\/\/([^:/?#]*):?(\d*)/i);

  return parts !== null && (parts[1] !== location.protocol || parts[2] !== location.hostname || parts[3] !== location.port);
}
