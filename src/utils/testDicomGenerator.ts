/**
 * Test DICOM File Generator
 * Creates a simple test DICOM file with valid pixel data for testing the viewer
 */

export interface TestDicomOptions {
    width?: number;
    height?: number;
    bitsAllocated?: number;
    numberOfFrames?: number;
    modality?: string;
    patientName?: string;
    studyDate?: string;
}

export class TestDicomGenerator {
    private static createDicomHeader(options: TestDicomOptions): ArrayBuffer {
        const {
            width = 512,
            height = 512,
            bitsAllocated = 16,
            numberOfFrames = 1,
            modality = 'CT',
            patientName = 'Test Patient',
            studyDate = '20240101'
        } = options;

        // Create a minimal DICOM header
        const header = new ArrayBuffer(132);
        const view = new DataView(header);

        // DICOM preamble (128 bytes of zeros)
        for (let i = 0; i < 128; i++) {
            view.setUint8(i, 0);
        }

        // DICOM signature
        view.setUint8(128, 0x44); // 'D'
        view.setUint8(129, 0x49); // 'I'
        view.setUint8(130, 0x43); // 'C'
        view.setUint8(131, 0x4D); // 'M'

        return header;
    }

    private static createDicomElements(options: TestDicomOptions): ArrayBuffer {
        const {
            width = 512,
            height = 512,
            bitsAllocated = 16,
            numberOfFrames = 1,
            modality = 'CT',
            patientName = 'Test Patient',
            studyDate = '20240101'
        } = options;

        // Create DICOM elements
        const elements: ArrayBuffer[] = [];

        // Patient Name (0010,0010)
        const patientNameBytes = new TextEncoder().encode(patientName);
        const patientNameElement = new ArrayBuffer(8 + patientNameBytes.length);
        const patientNameView = new DataView(patientNameElement);
        patientNameView.setUint32(0, 0x00100010, false); // Tag
        patientNameView.setUint16(4, 0x504E, false); // VR: PN
        patientNameView.setUint16(6, patientNameBytes.length, false); // Length
        new Uint8Array(patientNameElement, 8).set(patientNameBytes);

        // Study Date (0008,0020)
        const studyDateBytes = new TextEncoder().encode(studyDate);
        const studyDateElement = new ArrayBuffer(8 + studyDateBytes.length);
        const studyDateView = new DataView(studyDateElement);
        studyDateView.setUint32(0, 0x00080020, false); // Tag
        studyDateView.setUint16(4, 0x4441, false); // VR: DA
        studyDateView.setUint16(6, studyDateBytes.length, false); // Length
        new Uint8Array(studyDateElement, 8).set(studyDateBytes);

        // Modality (0008,0060)
        const modalityBytes = new TextEncoder().encode(modality);
        const modalityElement = new ArrayBuffer(8 + modalityBytes.length);
        const modalityView = new DataView(modalityElement);
        modalityView.setUint32(0, 0x00080060, false); // Tag
        modalityView.setUint16(4, 0x4353, false); // VR: CS
        modalityView.setUint16(6, modalityBytes.length, false); // Length
        new Uint8Array(modalityElement, 8).set(modalityBytes);

        // Rows (0028,0010)
        const rowsElement = new ArrayBuffer(12);
        const rowsView = new DataView(rowsElement);
        rowsView.setUint32(0, 0x00280010, false); // Tag
        rowsView.setUint16(4, 0x5553, false); // VR: US
        rowsView.setUint16(6, 2, false); // Length
        rowsView.setUint16(8, height, false); // Value

        // Columns (0028,0011)
        const columnsElement = new ArrayBuffer(12);
        const columnsView = new DataView(columnsElement);
        columnsView.setUint32(0, 0x00280011, false); // Tag
        columnsView.setUint16(4, 0x5553, false); // VR: US
        columnsView.setUint16(6, 2, false); // Length
        columnsView.setUint16(8, width, false); // Value

        // Bits Allocated (0028,0100)
        const bitsAllocatedElement = new ArrayBuffer(12);
        const bitsAllocatedView = new DataView(bitsAllocatedElement);
        bitsAllocatedView.setUint32(0, 0x00280100, false); // Tag
        bitsAllocatedView.setUint16(4, 0x5553, false); // VR: US
        bitsAllocatedView.setUint16(6, 2, false); // Length
        bitsAllocatedView.setUint16(8, bitsAllocated, false); // Value

        // Bits Stored (0028,0101)
        const bitsStoredElement = new ArrayBuffer(12);
        const bitsStoredView = new DataView(bitsStoredElement);
        bitsStoredView.setUint32(0, 0x00280101, false); // Tag
        bitsStoredView.setUint16(4, 0x5553, false); // VR: US
        bitsStoredView.setUint16(6, 2, false); // Length
        bitsStoredView.setUint16(8, bitsAllocated, false); // Value

        // Samples Per Pixel (0028,0002)
        const samplesPerPixelElement = new ArrayBuffer(12);
        const samplesPerPixelView = new DataView(samplesPerPixelElement);
        samplesPerPixelView.setUint32(0, 0x00280002, false); // Tag
        samplesPerPixelView.setUint16(4, 0x5553, false); // VR: US
        samplesPerPixelView.setUint16(6, 2, false); // Length
        samplesPerPixelView.setUint16(8, 1, false); // Value

        // Number of Frames (0028,0008)
        const numberOfFramesElement = new ArrayBuffer(12);
        const numberOfFramesView = new DataView(numberOfFramesElement);
        numberOfFramesView.setUint32(0, 0x00280008, false); // Tag
        numberOfFramesView.setUint16(4, 0x4953, false); // VR: IS
        numberOfFramesView.setUint16(6, 1, false); // Length
        numberOfFramesView.setUint8(8, numberOfFrames.toString().charCodeAt(0)); // Value

        // Window Center (0028,1050)
        const windowCenterElement = new ArrayBuffer(12);
        const windowCenterView = new DataView(windowCenterElement);
        windowCenterView.setUint32(0, 0x00281050, false); // Tag
        windowCenterView.setUint16(4, 0x4453, false); // VR: DS
        windowCenterView.setUint16(6, 4, false); // Length
        windowCenterView.setUint32(8, 0x31363200, false); // "162"

        // Window Width (0028,1051)
        const windowWidthElement = new ArrayBuffer(12);
        const windowWidthView = new DataView(windowWidthElement);
        windowWidthView.setUint32(0, 0x00281051, false); // Tag
        windowWidthView.setUint16(4, 0x4453, false); // VR: DS
        windowWidthView.setUint16(6, 4, false); // Length
        windowWidthView.setUint32(8, 0x33383500, false); // "385"

        // Combine all elements
        const totalLength = elements.reduce((sum, el) => sum + el.byteLength, 0);
        const combined = new ArrayBuffer(totalLength);
        let offset = 0;

        for (const element of elements) {
            new Uint8Array(combined, offset).set(new Uint8Array(element));
            offset += element.byteLength;
        }

        return combined;
    }

    private static createTestPixelData(options: TestDicomOptions): ArrayBuffer {
        const {
            width = 512,
            height = 512,
            bitsAllocated = 16,
            numberOfFrames = 1
        } = options;

        const pixelsPerFrame = width * height;
        const bytesPerPixel = bitsAllocated / 8;
        const totalPixels = pixelsPerFrame * numberOfFrames;
        const totalBytes = totalPixels * bytesPerPixel;

        const pixelData = new ArrayBuffer(totalBytes);
        const view = new DataView(pixelData);

        // Create a test pattern with varying pixel values
        for (let frame = 0; frame < numberOfFrames; frame++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (frame * pixelsPerFrame + y * width + x) * bytesPerPixel;

                    // Create a gradient pattern with some variation
                    const gradientValue = Math.floor((x / width) * 4095); // 12-bit range
                    const noiseValue = Math.floor(Math.sin(x * 0.1) * Math.cos(y * 0.1) * 100);
                    const finalValue = Math.max(0, Math.min(4095, gradientValue + noiseValue));

                    if (bitsAllocated === 16) {
                        view.setUint16(pixelIndex, finalValue, false); // Big endian
                    } else if (bitsAllocated === 8) {
                        view.setUint8(pixelIndex, Math.floor(finalValue / 16)); // Scale down to 8-bit
                    }
                }
            }
        }

        return pixelData;
    }

    public static generateTestDicom(options: TestDicomOptions = {}): ArrayBuffer {
        const header = this.createDicomHeader(options);
        const elements = this.createDicomElements(options);
        const pixelData = this.createTestPixelData(options);

        // Create pixel data element
        const pixelDataElement = new ArrayBuffer(8 + pixelData.byteLength);
        const pixelDataView = new DataView(pixelDataElement);
        pixelDataView.setUint32(0, 0x7FE00010, false); // Pixel Data tag
        pixelDataView.setUint16(4, 0x4F57, false); // VR: OW
        pixelDataView.setUint16(6, pixelData.byteLength, false); // Length
        new Uint8Array(pixelDataElement, 8).set(new Uint8Array(pixelData));

        // Combine all parts
        const totalLength = header.byteLength + elements.byteLength + pixelDataElement.byteLength;
        const result = new ArrayBuffer(totalLength);
        let offset = 0;

        // Copy header
        new Uint8Array(result, offset).set(new Uint8Array(header));
        offset += header.byteLength;

        // Copy elements
        new Uint8Array(result, offset).set(new Uint8Array(elements));
        offset += elements.byteLength;

        // Copy pixel data
        new Uint8Array(result, offset).set(new Uint8Array(pixelDataElement));

        return result;
    }

    public static createTestDicomBlob(options: TestDicomOptions = {}): Blob {
        const dicomData = this.generateTestDicom(options);
        return new Blob([dicomData], { type: 'application/dicom' });
    }

    public static createTestDicomUrl(options: TestDicomOptions = {}): string {
        const blob = this.createTestDicomBlob(options);
        return URL.createObjectURL(blob);
    }
}

export default TestDicomGenerator;
