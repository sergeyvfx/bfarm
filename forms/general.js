{
  "class"   : "Grid",
  "rows"    : 3,
  "cols"    : 1,
  "childs" : [
    {
      "class"   : "Grid",
      "rows"    : 9,
      "cols"    : 2,
      "padding" : 2,
      "childs" : [
        {"class" : "Label",
         "text"  : "Radio"},
        {"class" : "RadioGroup",
         "value" : 1,
         "items" : [{"title": 123, "value": 1},
                    {"title": 321, "value": 2},
                    {"title": "qqq", "value": 3}]},
        {"class" : "Label",
         "text"  : "Toggle"},
        {"class" : "ToggleButton",
         "title" : "Toggle"},
        {"class" : "Label",
         "text"  : "Название"},
        {"class" : "Entry",
         "text"  : "Пробный контест",
         "name"  : "contest_name"},

        {"class" : "Label",
         "text"  : "Правила проведения"},
        {"class" : "ComboBox",
         "items" : ["ACM", "Кировские"]},

        {"class" : "Label",
         "text"  : "Продолжительность"},
        {"class" : "SpinButton"},

        {"class" : "Label",
         "text"  : "Время заморозки"},
        {"class" : "SpinButton"},

        {"class" : "Label",
         "text"  : "Штраф за попытку"},
        {"class" : "SpinButton"},

        {"class" : "Label",
         "text"  : "Количетсво попыток"},
        {"class" : "SpinButton"}
      ]
    },
    {"class": "FileEntry"},
    {
      "class": "Panel",
      "withBorder": false,
      "childs": [
        {
          "class": "PanelBox",
          "collapsed": true,
          "title": "Архив с условием",
          "childs": [
            {"class": "Button",
             "title": "Залить архив"}
          ]
        }
      ]
    }
  ]
}
