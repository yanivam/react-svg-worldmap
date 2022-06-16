# CHANGELOG

## 1.0.22

- On hover - add highlight to border of current country by making the stroke 2 instead of 1.

## 1.0.23

- On hover - refine the highlighting.

## 1.0.24

- Fixed dependency bug for d3-geo not being a module
- Added marker type that is still in progress in beta (see README.md file for more detail)

## 1.0.25

- Renamed the islands to avoid confusion
- Added user control over map styling using stylingFunction (see README.md file for more detail)

## 1.0.26

- Bug fix returning functionality due to the default styling function

## 1.0.27

- Bug fix, console.log that was forgotten, solved issue

## 1.0.28

- Marker update, changed the style of markers and updated them to be circular because I believe that those would be more optimal for small countries rather than a larger icon like the old version

## 1.0.29

- Reduce the size of the countries.geo.json by limiting number precision to 3 digits

## 1.0.30

- Tried to reduce the size of countries.geo.json even more by changing the structure of the file and adding the extra properties programmatically.
- Changed names so they have spaces in between multiple words ex. UnitedStates -> United States

## 1.0.31

- Fixed bug with new data where some countries did not display properly

## 1.0.32

- Minify geo json.

## 1.0.33

- Uglified our exported files, looking for change in size of file

## 1.0.34

- Restored JSON to previous implementation so that it works with the code I wrote and highlights the right things

## 1.0.35

- Added localization ability and tooltip text customization through a callback function called tooltipTextFunction
- Added example of how to use to examples

## 1.0.36

- README.md typo

## 1.0.37

- Onclick callback as requested, for instructions on usage see README.md, for an example look at the example folder under onclick-example.

## 1.0.38

- Contribution thanks to [GoncaloGarcia]: https://github.com/GoncaloGarcia
- Allow setting background color and strokeOpacity as props

## 1.0.39

- Added README gif and fixed errors in README
- Fixed errors in the localization example due to a mismatch of data and title

## 1.0.40

- Updated tooltip to allow for multiline functionality
- Added size xxl which supports 1200x1200 map sizes

## 1.0.41

- Responsive size option for different sized layouts (mobile/desktop/tablet/etc...)

## 1.0.42

- Deprecated marker functionality to fix improper highlight bug.
- Erased console.log

## 1.0.43

- Restructured file system to enable JavaScript and TypeScript usage and ability (see README.md for usage in JS vs TS)

## 1.1.0

- Refactor build and dependency cleanup
- Moved code to lib folder

## 2.0.0-alpha.0

- Move examples and documentation to Website on Github pages
- Changed master to main
- New feature: testLabelFunction callback
- New feature: double-click to zoom map
- New feature: Export isoCode type
- New feature: Optional numeric value for 'size'
- New feature: SSR-compatible rendering
