// File: timezonelookup.d.ts

// This declares the shape of the module you are exporting from timezoneLookup.js
export class TimezoneLookup {
  /**
   * Indicates if the GeoJSON data has been successfully loaded and the service is ready.
   */
  public isReady: boolean;

  /**
   * Creates a new instance of the TimezoneLookup service.
   */
  constructor();

  /**
   * Initializes the module by fetching and parsing the GeoJSON data.
   * Must be called and awaited before getTimeOffsetAndName can be used.
   * @param geojsonFilename The name of the GeoJSON file bundled with the package. Defaults to 'timezones.geojson'.
   * @returns A promise that resolves when data is loaded, or rejects on error.
   */
  public initialize(geojsonFilename?: string): Promise<void>;

  /**
   * Finds the timezone name and UTC offset for the given geographic coordinates.
   * Call after initialize() has completed.
   * @param lat The latitude of the point.
   * @param lon The longitude of the point.
   * @returns An object with timezone name and offset string, or null if not found or not ready.
   * Example: { name: "America/New_York", offset: "UTC-05:00" }
   */
  public getTimeOffsetAndName(lat: number, lon: number): { name: string; offset: string } | null;
}