import QRCode from 'qrcode';

export const generateAssetQR = async (assetId: string) => {
  try {
    // Generate a data URL containing the QR code
    // In production, this would link to something like:
    // https://college-cms.edu/scan/ASSET_ID
    const url = `ASSET_SCAN:${assetId}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 400,
      margin: 2
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR Generation Error:', err);
    throw err;
  }
};
