// OHIF Configuration for DICOM Server Integration
export const ohifConfig = {
    routerBasename: '/',
    extensions: [
        '@ohif/extension-cornerstone',
        '@ohif/extension-measurement-tracking'
    ],
    modes: ['@ohif/mode-longitudinal'],
    showStudyList: true,
    defaultDataSourceName: 'dicomweb',
    dataSources: [
        {
            namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
            sourceName: 'dicomweb',
            configuration: {
                friendlyName: 'IntelliDiag DICOM Server',
                wadoUriRoot: '/api/dicom/wado-uri',
                qidoRoot: '/api/dicom/wado-rs',
                wadoRoot: '/api/dicom/wado-rs',
                qidoSupportsIncludeField: false,
                supportsReject: false,
                imageRendering: 'wadors',
                thumbnailRendering: 'wadors',
                enableStudyLazyLoad: true,
                supportsFuzzyMatching: false,
                supportsWildcard: true,
                staticWado: true,
                singlepart: 'bulkdata,video',
                // Custom headers for authentication
                requestInterceptor: (request: any) => {
                    const token = localStorage.getItem('supabase.auth.token');
                    if (token) {
                        request.headers = {
                            ...request.headers,
                            'Authorization': `Bearer ${token}`
                        };
                    }
                    return request;
                }
            },
        },
    ],
    // UI Configuration
    ui: {
        studyList: {
            showStudyList: true,
            studyListFunctionsEnabled: true,
        },
        leftSidebarOpen: false,
        rightSidebarOpen: false,
    },
    // Viewer Configuration
    viewer: {
        // Enable measurement tools
        measurementTools: [
            'Length',
            'Angle',
            'RectangleROI',
            'EllipseROI',
            'CircleROI',
            'ArrowAnnotate',
            'Bidirectional',
            'CobbAngle',
            'FreehandMouse',
            'FreehandSculpterMouse',
            'Probe',
            'Rectangle',
            'TextMarker',
            'Eraser'
        ],
        // Enable window/level presets
        windowPresets: [
            {
                name: 'Soft Tissue',
                windowCenter: 40,
                windowWidth: 400
            },
            {
                name: 'Bone',
                windowCenter: 400,
                windowWidth: 1800
            },
            {
                name: 'Lung',
                windowCenter: -600,
                windowWidth: 1500
            },
            {
                name: 'Liver',
                windowCenter: 30,
                windowWidth: 150
            }
        ],
        // Enable hanging protocols
        hangingProtocols: [
            {
                id: 'default',
                name: 'Default',
                protocolMatchingRules: [
                    {
                        weight: 1,
                        attribute: 'Modality',
                        constraint: {
                            equals: {
                                value: 'CT'
                            }
                        }
                    }
                ],
                stages: [
                    {
                        id: 'defaultStage',
                        name: 'Default Stage',
                        viewportStructure: {
                            type: 'grid',
                            properties: {
                                rows: 1,
                                columns: 1
                            }
                        },
                        viewports: [
                            {
                                viewportOptions: {
                                    toolGroupId: 'default',
                                    initialImageOptions: {
                                        preset: 'middle'
                                    }
                                },
                                displaySets: [
                                    {
                                        id: 'defaultDisplaySet',
                                        matchedDisplaySetsIndex: 0
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // Tool Configuration
    tool: {
        // Enable all measurement tools
        enabledTools: [
            'Length',
            'Angle',
            'RectangleROI',
            'EllipseROI',
            'CircleROI',
            'ArrowAnnotate',
            'Bidirectional',
            'CobbAngle',
            'FreehandMouse',
            'FreehandSculpterMouse',
            'Probe',
            'Rectangle',
            'TextMarker',
            'Eraser'
        ],
        // Tool groups
        groups: [
            {
                id: 'default',
                name: 'Default Tools',
                tools: [
                    'Pan',
                    'Zoom',
                    'WindowLevel',
                    'Length',
                    'Angle',
                    'RectangleROI',
                    'EllipseROI',
                    'CircleROI',
                    'ArrowAnnotate',
                    'Bidirectional',
                    'CobbAngle',
                    'FreehandMouse',
                    'FreehandSculpterMouse',
                    'Probe',
                    'Rectangle',
                    'TextMarker',
                    'Eraser'
                ]
            }
        ]
    },
    // Layout Configuration
    layout: {
        // Enable multi-viewport layouts
        viewportLayouts: [
            {
                id: 'grid',
                name: 'Grid Layout',
                properties: {
                    rows: 1,
                    columns: 1
                }
            },
            {
                id: '2x2',
                name: '2x2 Grid',
                properties: {
                    rows: 2,
                    columns: 2
                }
            },
            {
                id: '1x3',
                name: '1x3 Grid',
                properties: {
                    rows: 1,
                    columns: 3
                }
            }
        ]
    }
};

export default ohifConfig;
