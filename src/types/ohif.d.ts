declare module '@ohif/viewer' {
    export class Viewer {
        constructor(options: any);
        destroy(): void;
    }
}

declare module '@ohif/extension-cornerstone' {
    export const extension: any;
}

declare module '@ohif/extension-measurement-tracking' {
    export const extension: any;
}
