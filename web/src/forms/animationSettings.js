{"class": "Grid",
 "cols": 2,
 "cellStyles": [[{"width": 150}, {"padding": [0, 0, 0, 4]}]],
 "childs": [
             {"class": "Label", "text": "Frame range"},
             {"class": "Grid",
              "cols": 2,
              "cellStyles": [[{"padding": [0, 30, 0, 0]}, {"padding": [0, 0, 0, 30]}]],
              "childs": [
                  {
                    "class": "Grid",
                    "cols": 2,
                    "cellStyles": [[{"width": 40}]],
                    "childs": [
                         {"class": "Label", "text": "from"},
                         {"class": "SpinButton", "min": -32768, "max": 32768}
                       ]
                  },
                  {
                    "class": "Grid",
                    "cols": 2,
                    "cellStyles": [[{"width": 40}]],
                    "childs": [
                        {"class": "Label", "text": "to"},
                        {"class": "SpinButton", "min": -32768, "max": 32768}
                      ]
                  }
                ]
            }
          ]
}
