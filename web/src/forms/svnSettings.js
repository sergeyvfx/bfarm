{"class": "Grid",
  "rows": 2,
  "cols": 1,
  "childs": [{"class": "Grid",
              "rows": 1,
              "cols": 5,
              "padding": 2,
              "cellStyles": [[{"width": 150}, {}, {"width": 10}, {"width": 64}, {"width": 100}]],
              "childs": [{"class": "Label", "text": "Repo"},
                         {"class": "Entry", "binding": "#jobSVNRepo"},
                         {"class": "Widget"},
                         {"class": "Label", "text": "Revision"},
                         {"class": "SpinButton", "binding": "#jobSVNRevision", "min": 0, "max": 999999}]
             },
             {"class": "Grid",
              "rows": 1,
              "cols": 2,
              "padding": 2,
              "cellStyles": [[{"width": 150}], []],
              "childs": [{"class": "Label", "text": "File"},
                         {"class": "Entry", "binding": "#jobSVNFile"}]
             }]
}
