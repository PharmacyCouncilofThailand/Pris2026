// Abstract Topics with subtopics
export interface AbstractTopic {
    title: string;
    subtopics: string[];
}

export const abstractTopics: AbstractTopic[] = [
    {
        title: "Antimicrobial Agents & Resistance",
        subtopics: [
            "Antimicrobial Agents and PK/PD",
            "Antimicrobial Resistance"
        ]
    },
    {
        title: "Antimicrobial Stewardship & Clinical Microbiology Diagnostics",
        subtopics: [
            "Antimicrobial Stewardship Program",
            "Clinical Microbiology and Diagnostics",
            "Diagnostic Stewardship"
        ]
    },
    {
        title: "Clinical Infectious Diseases (Bacterial, Fungal, Mycobacterial, Parasitic)",
        subtopics: [
            "Bacterial Infection",
            "Fungal Infection",
            "Tuberculosis and other Mycobacterial Infections",
            "Medical parasitology",
            "Clinical Syndromes"
        ]
    },
    {
        title: "Viral Infections & Immunology",
        subtopics: [
            "COVID-19",
            "HIV",
            "Viral Infection (All Viruses other than HIV and SARS-Cov-2)",
            "Vaccine and Immunology"
        ]
    },
    {
        title: "Healthcare Epidemiology & Infection Prevention/Control",
        subtopics: [
            "Healthcare Epidemiology",
            "Infection Prevention/Control"
        ]
    },
    {
        title: "Emerging Topics & Others",
        subtopics: [
            "Microbiome",
            "Public Health and Socioeconomic Impact",
            "Others"
        ]
    }
];

// Abstract Format
export interface AbstractFormatItem {
    category: string;
    content: {
        heading?: string;
        items: string[];
    }[];
}

export const abstractFormat: AbstractFormatItem[] = [
    {
        category: "Language",
        content: [{ items: ["English"] }]
    },
    {
        category: "Title",
        content: [{
            items: [
                "Capitalize the first letter of each word. Titles in ALL CAPS are not allowed.",
                "Refrain from using standard abbreviations or acronyms in the title."
            ]
        }]
    },
    {
        category: "Author Information",
        content: [
            {
                heading: "Name",
                items: [
                    "All co-authors' first and family name(s) must be provided in full.",
                    "Degrees or titles such as MD after an author's name must be deleted."
                ]
            },
            {
                heading: "Affiliation",
                items: [
                    "Affiliation should be structured as follows: Department, Institution and Country."
                ]
            }
        ]
    },
    {
        category: "Abstract Body",
        content: [
            {
                heading: "Text",
                items: [
                    "The text of the entire abstract must not exceed 250 words.",
                    "Use standard abbreviations or acronyms in the text. ALL CAPS are not allowed."
                ]
            },
            {
                heading: "Structure",
                items: [
                    "The abstract body can be written either as an original article or case report.",
                    "Original Article: Summary description of study/research set out in a systematic, stylized form under headings structured in: Background, Methods, Results, Conclusion.",
                    "Case Report: Summary description set out in a systematic, stylized form under headings structured in: Title, Introduction, Case Presentation, Conclusion."
                ]
            },
            {
                heading: "Pictures/Graphs/Tables",
                items: [
                    "You can only upload one file (jpeg or jpg file) of pictures, graphs or table per abstract."
                ]
            }
        ]
    }
];

// Submission process  
export const submissionProcess = {
    declaration: {
        title: "Declaration & Assignation",
        items: [
            "Abstracts must not have been published or presented at any other conference by any co-authors.",
            "The authors grant the ACCP 2026 Organizing Committee a royalty-free, irrevocable, and non-exclusive right to publish, reproduce, distribute, display or otherwise use the submitted abstracts. The authors will also retain the copyright of their abstracts."
        ]
    },
    acceptance: {
        title: "Acceptance Notification",
        items: [
            "Acceptance notification will be sent to the abstract submitter only.",
            "On receiving the acceptance notification, the abstract submitter must confirm attendance of the presenting author and instruct the presenting author to register no later than 20 October 2026. Accepted abstracts whose presenting author does not register and pay in full by then will be automatically withdrawn."
        ]
    },
    withdrawal: {
        title: "Abstract Withdrawal",
        content: "Authors who want to withdraw an abstract should send a written request to the secretariat at info@accp2026.com by 28 August 2026. Abstract withdrawal is deemed complete upon the confirmation of the secretariat."
    }
};

export const abstractTimeline = [
    {
        label: "Submission Opens",
        date: "January 15, 2026",
        icon: "fa-calendar-check",
        colorClass: "success",
        bgColor: "#e8f5e9",
        borderColor: "#4caf50",
        iconColor: "#4caf50",
        labelColor: "#2e7d32",
        dateColor: "#1b5e20"
    },
    {
        label: "Submission Deadline",
        date: "April 30, 2026",
        icon: "fa-calendar-xmark",
        colorClass: "danger",
        bgColor: "#ffebee",
        borderColor: "#f44336",
        iconColor: "#f44336",
        labelColor: "#c62828",
        dateColor: "#b71c1c"
    },
    {
        label: "Notification of Acceptance",
        date: "May 31, 2026",
        icon: "fa-envelope",
        colorClass: "primary",
        bgColor: "#e3f2fd",
        borderColor: "#2196f3",
        iconColor: "#2196f3",
        labelColor: "#1565c0",
        dateColor: "#0d47a1"
    },
    {
        label: "Full Paper Submission",
        date: "June 15, 2026",
        icon: "fa-file-lines",
        colorClass: "warning",
        bgColor: "#fff8e1",
        borderColor: "#ffc107",
        iconColor: "#ffc107",
        labelColor: "#f57f17",
        dateColor: "#e65100"
    }
]
