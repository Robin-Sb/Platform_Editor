## Platform Editor

+ [Designdokument](https://github.com/Robin-Sb/Platform_Editor/blob/master/files/Designdokument.pdf)
+ [Pages Editor](https://robin-sb.github.io/Platform_Editor/src/Editor/Main.html)
+ [Pages Game](https://robin-sb.github.io/Platform_Editor/src/Game/Main.html)
+ [Code + Dateien in Git](https://github.com/Robin-Sb/Platform_Editor/tree/master/src)
+ [Code Archiv](https://github.com/Robin-Sb/Platform_Editor/raw/master/files/Code_Archiv.zip)

| Nr | Bezeichnung           | Inhalt                                                                                                                                                                                                                                                                         |
|---:|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|    | Titel                 | Platform Editor
|    | Name                  | Robin Schwab
|    | Matrikelnummer        | 256325
|  1 | Nutzerinteraktion     | Im Editor: Navigieren der Szene über Shift + Mausbewegen / Objekte zur Szene hinzufügen über Mausklick / Objekte verschieben mit Drag and Drop (zum Grid snappen über Ctrl-links) / Selektierte Objekte entfernen über delete / Aktionen rückgängig machen über Ctrl + Z (experimentell). ///// Im Game: Bewegen über a/d oder linke/rechte Pfeiltasten / Springen mit Leertaste / Musik stummschalten mit m |
|  2 | Objektinteraktion     | Es wird jeden Frame überprüft, ob der Spieler eine Bewegung nach unten vollzieht, wenn er dabei mit dem Boden kollidieren würde, wird er nach oben translatiert. Außerdem wird geschaut, ob der Charakter mit einem Gegner kollidiert; wenn er von oben mit dem Gegner kollidiert, wird der Gegner entfernt, ansonsten hat man das Spiel verloren und der Game-Loop wird beendet. Zudem wird geprüft, ob der Gegner sich am Rande seiner begehbaren Plattformen befindet, ansonsten wird um 180° rotiert. |
|  3 | Objektanzahl variabel | Es wird immer im Editor ein neues Objekt erzeugt, sobald der Nutzer ein Objekt zur Szene hinzugefügt hat. Dabei wird einfach ein neues Objekt erzeugt, das die gleiche Translation hat wie das vorherige Objekt.     |                                                                                                                                         
|  4 | Szenenhierarchie      | Hierarchisch aufgebaute Objekte sind hierachisch organisiert, zum Beispiel die Zielfahne besitzt zwei Kinder Base und Top, bei denen die Transformation durch die Transformation der Parent-Node bestimmt wird. Ansonsten wurde auf eine komplexe Szenenhierachie verzichtet, damit beim Picking im Editor nicht jedes Mal die komplexe Hierachie durchsucht werden muss.                                                                                                                                               |
|  5 | Sound                 | Eine Hintergrundmusik ist eingebunden, die für eine fröhliche Atmosphäre sorgen soll. Außerdem werden jeweils Sounds abgespielt, wenn 1)  der Spieler einen Gegner besiegt 2) der Spieler von einem Gegner besiegt wird 3) das Spiel beendet wird. |
|  6 | GUI                   | Der Nutzer kann durch ein graphisches Interface neue Objekte zur Szene hinzufügen und diese an die richtige Stelle ziehen, um so interaktive Level zu erzeugen. Hier können durch Klicken neue Element hinzugefügt werden, vorhandene Objekte verschoben und entfernt werden sowie Aktionen rückgängig gemacht werden. Außerdem gibt es die Möglichkeit, Level über einen Button zu speichern und diese wieder zu laden.         |                                                                         
|  7 | Externe Daten         | Die erstellten Levels werden in einer externen JSON-Datei gespeichert, dieses Level kann im Spiel geladen werden. Damit können ganze Level über externe Daten erzeugt werden.                                                                                  |
|  8 | Verhaltensklassen     | In der Player Klasse wird definiert, wie der Spieler sich bewegt und mit Objekten interagiert (Kollision mit Boden/Gegnern). Außerdem werden dort Sprite-Animationen generiert. In der Enemy Klasse werden ebenfalls Sprite-Animationen generiert, außerdem wird das bei Programmstart näheste Bodenobjekt gesucht und alle benachbarten Bodenobjekte gespeichert (und nach x-Translation sortiert), sodass der Gegner sich in konstanter Zeit über den Boden bewegen kann. Zudem  ist in vielen Klassen definiert, wie diese sich erzeugen und serialisieren/deserialisieren.     |                                                                                       
|  9 | Subklassen            | Ein Interface PickableNode erbt von f.Node und definiert Funktionalitäten, die für das Picking wichtig sind. Die Klassen, die dieses Interface implementieren, verfügen somit über einheitliche Node- sowie Picking-Funktionalitäten. Die Enemy- und Player-Klassen erben außerdem von fAid.NodeSprite und erhalten damit Funktionen zum Anzeigen und Animieren von Sprites.  |
| 10 | Maße & Positionen     | Sowohl die Startkachel als auch der Spawn des Spielcharakters sind im Ursprung definiert, um einen reibungslosen Spielbeginn zu ermöglich. Außerdem wird eine einfache und gleichmäßige Anordnung der Spielobjekte durch Gridsnapping ermöglicht. Jegliche Kollisionsabfragen, die Berechnung von angrenzenden Bodenkacheln, etc. werden relativ zur Größe der Objekte berechnet, sodass die Funktionen auch problemlos auf Objekte unterschiedlicher Größe anwendbar sind.                                                                  |
| 11 | Event-System          | Es werden eine Vielzahl von Events aufgelöst. Die viewports im Editor verfügen für die Interaktion über Keyboard und Mouseevent Listener. Außerdem werden die Events zum Aurufen von update-Funktionen in jedem Schleifendurchlauf benutzt.                                                                                                                                                                                 |
