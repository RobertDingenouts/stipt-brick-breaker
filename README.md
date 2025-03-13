# Stipt Brick Breaker

Welkom bij **Stipt Brick Breaker**, een klassiek breakout-spel met een moderne Stipt-twist! Vernietig alle bakstenen, versla de eindbaas (een betonblok), en behaal de hoogste score. Dit spel is speelbaar op zowel pc als mobiele apparaten.

## Over het spel
In Stipt Brick Breaker bestuur je een schieter die bakstenen vernietigt door kogels af te vuren. Er is een betonblok als eindbaas dat vanaf het begin aanwezig is en mee naar beneden beweegt. Je wint door het betonblok 20 keer te raken, maar verliest als het betonblok of de bakstenen jouw schieter raken.

### Kenmerken
- **Consistente gameplay**: Het spel werkt op zowel pc als mobiel, met een vaste canvasbreedte van 800px voor een uniforme ervaring.
- **Touchbediening**: Soepele touchbesturing op mobiele apparaten, waarbij de schieter over de hele breedte (0-800px) kan bewegen.
- **Eindbaas**: Een betonblok dat over de hele breedte van de canvas strekt (800px), vanaf het begin aanwezig is, en mee naar beneden beweegt. Je moet het 20 keer raken om te winnen.
- **Power-ups**: Kans op power-ups die verschijnen wanneer je bakstenen vernietigt.
- **Stipt-stijl**: Kleuren in Stipt-grijs (#5A5A5A) en Stipt-oranje (#E18B22), met een witte achtergrond (#FFFFFF) die past bij de Stipt-branding.
- **Geluidseffecten**: Waarschuwingsgeluid en break-geluid bij het raken van bakstenen of het betonblok.

## Hoe te spelen
1. **Start het spel**:
   - Klik op de "Start Spel"-knop (of tik op mobiel).
2. **Besturing**:
   - **Pc**: Beweeg de muis naar links of rechts om de schieter te bewegen.
   - **Mobiel**: Sleep je vinger over de canvas om de schieter te bewegen.
   - De schieter schiet automatisch kogels omhoog.
3. **Doel**:
   - Vernietig alle bakstenen door ze te raken met kogels.
   - Raak het betonblok (eindbaas) 20 keer om te winnen.
   - Vermijd dat de bakstenen of het betonblok jouw schieter raken, anders is het game over.
4. **Power-ups**:
   - Bij het vernietigen van bakstenen kunnen power-ups verschijnen. Vang ze met de schieter om tijdelijk sneller te schieten.
5. **Levels**:
   - Het spel heeft 10 levels. Bij elk level wordt de snelheid van de bakstenen iets verhoogd.

## Installatie
1. **Download de bestanden**:
   - Clone of download deze repository naar je lokale machine.
2. **Open het spel**:
   - Open `index.html` in een moderne webbrowser (bijv. Chrome, Firefox).
   - Voor ontwikkeling kun je een lokale server gebruiken (bijv. via Live Server in VSCodium).
3. **Zorg voor assets**:
   - Plaats de benodigde afbeeldingen en geluiden in de `assets`-map:
     - `baksteen.png`: Afbeelding van de bakstenen.
     - `boss.png`: Afbeelding van het betonblok (eindbaas, 800x50px).
     - `logo.png`: Afbeelding van de schieter.
     - `orange_dot.png`: Afbeelding van de kogels.
     - `powerup.png`: Afbeelding van de power-ups.
     - `warning.wav`: Waarschuwingsgeluid.
     - `break.wav`: Geluid bij het breken van bakstenen of raken van het betonblok.

## Bestandsstructuur
- `index.html`: Hoofdpagina van het spel.
- `styles.css`: Styling met Stipt-kleuren (grijs #5A5A5A, oranje #E18B22, witte achtergrond #FFFFFF).
- `game.js`: Bevat de spel-logica, touchbediening, en eindbaas-mechanieken.
- `assets/`: Map met afbeeldingen en geluiden.

## Ontwikkeling
- **Canvas**: Het spel gebruikt een canvas met een vaste breedte van 800px voor consistente gameplay op pc en mobiel.
- **Touchfixes**: De touchbediening is geoptimaliseerd om over de hele breedte te werken, met schalingcorrectie voor hoge DPI-schermen.
- **Eindbaas**: Het betonblok is aanwezig vanaf het begin, beweegt mee met `brickOffsetY`, en vereist 20 treffers om te verslaan.
- **CSS**: Het win-bericht is gecentreerd in het midden van de canvas met `position: absolute` en `transform: translate`.

## Bekende problemen
- Zorg dat alle afbeeldingen correct laden in de `assets`-map, anders verschijnen elementen niet.
- Op sommige mobiele apparaten kan de touchbediening een kleine vertraging hebben bij lage prestaties.

## Toekomstige verbeteringen
- Voeg een scorebord toe om de hoogste scores bij te houden.
- Implementeer meerdere soorten power-ups (bijv. grotere schieter, extra kogels).
- Voeg animaties toe aan het betonblok bij elke treffer.

## Credits
- Ontwikkeld door [jouw naam].
- Gebouwd met HTML5 Canvas, JavaScript, en CSS.
- Geïnspireerd door klassieke breakout-spellen, met een Stipt-thema.

## Licentie
© 2025 [jouw naam]. Alle rechten voorbehouden.  
Dit spel en de bijbehorende code mogen niet worden gebruikt, gekopieerd, aangepast, of verspreid zonder expliciete schriftelijke toestemming van de maker. Voor gebruiksverzoeken, neem contact op met [jouw contactgegevens].
