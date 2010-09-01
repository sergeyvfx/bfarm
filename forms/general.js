{
  "class"   : "Grid",
  "rows"    : 2,
  "cols"    : 1,
  "childs" : [
    {
      "class"   : "Grid",
      "rows"    : 7,
      "cols"    : 2,
      "padding" : 2,
      "childs" : [
        {"class" : "Label",
         "text"  : "Название"},
        {"class" : "Entry",
         "text"  : "Пробный контест"},

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
