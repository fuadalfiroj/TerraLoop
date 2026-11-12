// NASA Earth Observations Engine & Data Harmonization Layer
// Integrates NASA POWER, SMAP, ECOSTRESS, GPM, Landsat, MODIS, GRACE, and SRTM proxies.

export const NASA_DATASETS = [
  {
    id: 'smap',
    name: 'SMAP (Soil Moisture Active Passive)',
    sensor: 'L-band Radar & Radiometer (Assimilated L4)',
    resolution: '9 km / 0.1° gridded',
    temporal: '2–3 day revisit / Daily model assimilation',
    parameter: 'Root-zone (0–100 cm) & Surface (0–5 cm) soil wetness (GWETROOT, GWETPROF)',
    application: 'Detects agricultural drought, waterlogging, and infiltration capacity before visible crop wilt.'
  },
  {
    id: 'power',
    name: 'NASA POWER (Prediction of Worldwide Energy Resources)',
    sensor: 'GMAO MERRA-2 & GEOS-FP assimilation / CERES solar',
    resolution: '0.5° × 0.5° latitude/longitude (~50 km)',
    temporal: 'Daily point & regional timeseries (1981–present)',
    parameter: 'Precipitation (PRECTOTCORR), T2M, T2M_MAX, T2M_MIN, Solar (ALLSKY_SFC_SW_DWN), Wind (WS2M), RH2M',
    application: 'Long-term agroclimatology, degree days, heat waves, frost risk, and reference evapotranspiration.'
  },
  {
    id: 'gpm',
    name: 'GPM (Global Precipitation Measurement) / IMERG',
    sensor: 'Dual-frequency Precipitation Radar & GMI Radiometer constellation',
    resolution: '0.1° × 0.1° (~10 km)',
    temporal: 'Half-hourly to daily',
    parameter: 'Precipitation rate, extreme rain events (>50mm, >100mm), storm erosivity (RUSLE R-factor)',
    application: 'Runoff risk, rainfall erosivity index, flash flooding, and monsoon onset tracking.'
  },
  {
    id: 'ecostress',
    name: 'ECOSTRESS (ECOsystem Spaceborne Thermal Radiometer on ISS)',
    sensor: 'Multispectral Thermal Infrared Radiometer',
    resolution: '70 m field-scale resolution',
    temporal: 'Variable 1–5 days (ISS precession orbit)',
    parameter: 'Evaporative Stress Index (ESI), Evapotranspiration (ET), Water Use Efficiency (WUE)',
    application: 'Early plant water stress detection days before chlorosis; microclimate heat hotspots.'
  },
  {
    id: 'modis_landsat',
    name: 'MODIS & Landsat (Surface Reflectance & Thermal)',
    sensor: 'Terra/Aqua MODIS (250m–1km) + Landsat 8/9 OLI/TIRS (30m)',
    resolution: '30 m (Landsat) to 250 m (MODIS)',
    temporal: 'Daily (MODIS) to 8–16 days (Landsat)',
    parameter: 'Normalized Difference Vegetation Index (NDVI), Land Surface Temperature (LST)',
    application: 'Canopy vigor, bare-soil detection, green manure biomass estimation, and harvest tracking.'
  },
  {
    id: 'grace',
    name: 'GRACE & GRACE-FO (Gravity Recovery and Climate Experiment)',
    sensor: 'Twin K-band / Laser Inter-satellite Ranging',
    resolution: '300–400 km footprint (~3° gridded equivalent)',
    temporal: 'Monthly mass anomaly grids',
    parameter: 'Terrestrial Water Storage Anomaly (TWSA), deep aquifer depletion rate',
    application: 'Multi-year regional groundwater depletion trends and multi-season basin drought storage.'
  },
  {
    id: 'srtm',
    name: 'SRTM / NASADEM (Shuttle Radar Topography Mission)',
    sensor: 'C-band Interferometric Synthetic Aperture Radar',
    resolution: '1 arc-second (~30 m)',
    temporal: 'Static global digital elevation model',
    parameter: 'Elevation (m), slope steepness (%), aspect, catchment drainage accumulation',
    application: 'Topographic slope length (RUSLE LS-factor), flood inundation pooling zones, and terracing needs.'
  }
];

export const NASA_DATASET_CATALOG = [
  {
    id: 'power',
    name: 'NASA POWER',
    fullName: 'Prediction of Worldwide Energy Resources',
    status: 'connected',
    statusLabel: 'Live API Connected',
    url: 'https://power.larc.nasa.gov/',
    why: 'Provides 5 years of daily temperature (min, max, mean), precipitation, solar irradiance, wind speed, and relative humidity data for the exact farm coordinates. Powers the agro-climatic grid, heat/frost stress day counting, reference evapotranspiration (ET₀), and 5-year climate trend regressions.',
    parameters: 'PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN, WS2M, RH2M, GWETROOT, GWETPROF',
    resolution: '0.5° × 0.5° (~50 km)',
    localFile: 'nasa-power-rajshahi.json, nasa-power-kurigram.json, nasa-power-rangpur.json',
    howUsed: 'Real-time fetch via public REST API when user clicks "Connect NASA live". Downloaded JSON files serve as offline fallback for the 3 regional case studies.'
  },
  {
    id: 'srtm',
    name: 'NASA SRTM / NASADEM',
    fullName: 'Shuttle Radar Topography Mission',
    status: 'connected',
    statusLabel: 'Live API Connected',
    url: 'https://www2.jpl.nasa.gov/srtm/',
    why: 'Derives field elevation (meters above sea level) and slope steepness to calculate the RUSLE topographic length-slope factor (LS), which determines how fast water runs off the field and how much soil it carries away.',
    parameters: 'Elevation (m), Slope (%)',
    resolution: '1 arc-second (~30 m)',
    localFile: 'None (queried live)',
    howUsed: 'Fetched via Open-Meteo elevation API endpoint at farm coordinates. Used to calculate the LS-factor in RUSLE erosion modeling.'
  },
  {
    id: 'smap',
    name: 'NASA SMAP',
    fullName: 'Soil Moisture Active Passive (L4 Assimilation)',
    status: 'model',
    statusLabel: 'Modeled from POWER',
    url: 'https://smap.jpl.nasa.gov/',
    why: 'Tracks root-zone (0–100 cm) and surface (0–5 cm) soil wetness to detect agricultural drought and waterlogging before crops show visible stress. Informs dry-season irrigation deficit calculations.',
    parameters: 'GWETROOT, GWETPROF (root-zone & profile soil wetness)',
    resolution: '9 km / 0.1° gridded',
    localFile: 'None (assimilated via POWER)',
    howUsed: 'SMAP L4 soil moisture is assimilated into NASA POWER daily outputs (GWETROOT, GWETPROF parameters). TerraLoop reads these directly from the POWER API response.'
  },
  {
    id: 'gpm',
    name: 'NASA GPM / IMERG',
    fullName: 'Global Precipitation Measurement / Integrated Multi-satellitE Retrievals',
    status: 'model',
    statusLabel: 'Derived from POWER',
    url: 'https://gpm.nasa.gov/',
    why: 'Tracks extreme storm intensity (>50 mm/day and >100 mm/day events) which drive the rainfall erosivity factor (R) in the RUSLE soil loss equation. Heavy storms splash-dislodge soil aggregates and initiate rill and gully erosion.',
    parameters: 'Precipitation rate, extreme rain day count, RUSLE R-factor',
    resolution: '0.1° × 0.1° (~10 km)',
    localFile: 'None (computed from POWER precipitation)',
    howUsed: 'Extreme rainfall days are counted from NASA POWER daily precipitation data. The R-factor is computed using the empirical equation R = 0.0483 × Rain^1.61.'
  },
  {
    id: 'ecostress',
    name: 'NASA ECOSTRESS',
    fullName: 'ECOsystem Spaceborne Thermal Radiometer on ISS',
    status: 'model',
    statusLabel: 'Calculated via Hargreaves',
    url: 'https://ecostress.jpl.nasa.gov/',
    why: 'Measures plant water stress through thermal infrared imaging. TerraLoop uses ECOSTRESS-derived methodology to calculate reference evapotranspiration (ET₀) — how much water the atmosphere demands from crops — using the Hargreaves-Samani equation.',
    parameters: 'Reference ET₀ (mm/day), Evaporative Stress Index proxy',
    resolution: '70 m field-scale',
    localFile: 'None (computed client-side)',
    howUsed: 'ET₀ is calculated from POWER temperature and solar data using the Hargreaves-Samani method, which approximates ECOSTRESS actual ET measurements.'
  },
  {
    id: 'modis_landsat',
    name: 'MODIS & Landsat',
    fullName: 'Moderate Resolution Imaging Spectroradiometer & Landsat 8/9 OLI/TIRS',
    status: 'model',
    statusLabel: 'Crop Cover Factor',
    url: 'https://modis.gsfc.nasa.gov/',
    why: 'Provides vegetation indices (NDVI) for determining canopy ground protection. Used to assign the RUSLE crop cover management factor (C-factor), identifying bare-field windows where topsoil is vulnerable.',
    parameters: 'NDVI, Land Surface Temperature, C-factor',
    resolution: '30 m (Landsat) to 250 m (MODIS)',
    localFile: 'None (C-factor from crop database)',
    howUsed: 'MODIS/Landsat-calibrated C-factors are assigned per crop species in the crop database (e.g., Rice: 0.18, Bare Fallow: 0.65). MODIS true-color imagery is available via the GIBS tile layer in the map.'
  },
  {
    id: 'grace',
    name: 'NASA GRACE / GRACE-FO',
    fullName: 'Gravity Recovery and Climate Experiment / Follow-On',
    status: 'reference',
    statusLabel: 'Published Reference',
    url: 'https://grace.jpl.nasa.gov/',
    why: 'Monitors multi-year regional groundwater aquifer depletion from deep tubewell pumping. The Ganges-Brahmaputra basin shows -1.8 cm/year water storage decline, signaling that irrigation-heavy rotations may become unsustainable.',
    parameters: 'Terrestrial Water Storage Anomaly (TWSA): -1.8 cm/yr',
    resolution: '300–400 km footprint',
    localFile: 'None (published constant)',
    howUsed: 'The published GRACE TWSA depletion rate is displayed as a groundwater sustainability benchmark on the Earth Observations dashboard and factored into the strategy explainability dossier.'
  },
  {
    id: 'firms',
    name: 'NASA FIRMS',
    fullName: 'Fire Information for Resource Management System',
    status: 'reference',
    statusLabel: 'Regional Statistics',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    why: 'Tracks active fire and thermal anomaly hotspots from MODIS and VIIRS satellites to monitor crop stubble and residue burning, which destroys topsoil organic carbon and releases pollutants.',
    parameters: 'Annual fire count, carbon lost (tonnes), risk level',
    resolution: '375 m (VIIRS) / 1 km (MODIS)',
    localFile: 'firms-fire-hotspots.json',
    howUsed: 'Pre-downloaded regional fire statistics are used to evaluate stubble burning impact and incentivize mulching over burning in the Resilience Passport.'
  },
  {
    id: 'sedac',
    name: 'NASA SEDAC (CIESIN)',
    fullName: 'Socioeconomic Data and Applications Center',
    status: 'reference',
    statusLabel: 'Benchmark Data',
    url: 'https://sedac.ciesin.columbia.edu/',
    why: 'Provides global agricultural fertilizer application grids. Used to benchmark planned synthetic nitrogen input against regional application rates, showing how legume rotations can reduce urea dependency.',
    parameters: 'Synthetic N (kg/ha), Phosphorus (kg/ha), Cropping Intensity (%)',
    resolution: 'Administrative division level',
    localFile: 'sedac-agricultural-indicators.json',
    howUsed: 'Pre-downloaded benchmark data compares farmer\'s planned fertilizer use against SEDAC regional averages in the Resilience Passport.'
  },
  {
    id: 'worldview',
    name: 'NASA Worldview / GIBS',
    fullName: 'Global Imagery Browse Services',
    status: 'connected',
    statusLabel: 'Live Tile Layer',
    url: 'https://worldview.earthdata.nasa.gov/',
    why: 'Provides true-color satellite imagery (MODIS Terra Corrected Reflectance) that farmers can visually browse to see flood extent, vegetation greenness, smoke, and seasonal land cover changes.',
    parameters: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    resolution: '250 m visible',
    localFile: 'None (live tile service)',
    howUsed: 'GIBS WMTS tile layer is integrated directly into the Leaflet field map as a toggleable satellite imagery layer alongside Esri and OpenStreetMap.'
  },
  {
    id: 'giovanni',
    name: 'NASA Giovanni',
    fullName: 'Geospatial Interactive Online Visualization ANd aNalysis',
    status: 'linked',
    statusLabel: 'Portal Deep Link',
    url: 'https://giovanni.gsfc.nasa.gov/',
    why: 'Allows farmers and agronomists to generate multi-year climate time series, spatial maps, and anomaly plots with zero coding, using pre-configured bounding boxes around the farm.',
    parameters: 'Temperature, precipitation, soil moisture time-series',
    resolution: 'Variable (depends on product)',
    localFile: 'None (web portal)',
    howUsed: 'TerraLoop generates coordinate-targeted deep links that open Giovanni with the farm\'s bounding box pre-filled.'
  },
  {
    id: 'earthdata_search',
    name: 'NASA Earthdata Search',
    fullName: 'Cross-DAAC Satellite Data Discovery',
    status: 'linked',
    statusLabel: 'Portal Deep Link',
    url: 'https://search.earthdata.nasa.gov/',
    why: 'Central hub to search, filter, and download granules from all 12 NASA Distributed Active Archive Centers. Lets users access the raw satellite datasets behind TerraLoop\'s models.',
    parameters: 'SMAP, ECOSTRESS, GPM granule search',
    resolution: 'Varies by product',
    localFile: 'None (web portal)',
    howUsed: 'TerraLoop generates deep links pre-filtered for SMAP, ECOSTRESS, and GPM data at the farm coordinates.'
  }
];

export const SATELLITE_VS_GROUND = [
  {
    aspect: 'Spatial Scale',
    satellite: 'Gridded average over 70m to 50km footprint; smooths local micro-variations.',
    ground: 'Point sensor (rain gauge, soil core, tensiometer); accurate at probe location only.',
    fusionRole: 'Satellite provides complete spatial coverage; ground points calibrate regional bias.'
  },
  {
    aspect: 'Soil Depth Sampling',
    satellite: 'Microwave skin depth measures 0–5 cm; root-zone (0–100 cm) is model-assimilated (SMAP L4).',
    ground: 'Physical sensors can be installed directly at root depth (15cm, 30cm, 60cm).',
    fusionRole: 'Use ground probes to verify subsoil moisture while using SMAP to track landscape-scale trends.'
  },
  {
    aspect: 'Temporal Consistency',
    satellite: 'Regular repeat cycles (daily to 16 days); unaffected by local maintenance failures.',
    ground: 'Continuous 15-minute loggers; susceptible to sensor drift, fouling, power loss, and vandalism.',
    fusionRole: 'Satellite fills gaps during station downtime; ground provides instant sub-daily event spikes.'
  },
  {
    aspect: 'Atmospheric Influence',
    satellite: 'Optical/Thermal (Landsat, ECOSTRESS) blocked by monsoon cloud cover; Radar (SMAP, Sentinel-1) penetrates clouds.',
    ground: 'Direct contact measurement; operates identically in clear sky, fog, or torrential rain.',
    fusionRole: 'Radar & reanalysis maintain continuity when persistent monsoon clouds obscure optical satellites.'
  }
];

// Approximate reference evapotranspiration (ET0) using Hargreaves-Samani method
// validated for tropical sub-humid agro-ecological zones (like Bangladesh)
export function calculateReferenceET(tMin, tMax, tMean, solarRadMJ, latDeg) {
  if (!Number.isFinite(tMin) || !Number.isFinite(tMax) || !Number.isFinite(solarRadMJ)) {
    return Math.max(2.5, Math.min(6.5, (tMean || 25) * 0.16));
  }
  const deltaT = Math.max(1, tMax - tMin);
  // Hargreaves-Samani: ET0 = 0.0023 * (Tmean + 17.8) * sqrt(Tmax - Tmin) * Ra_equiv
  // solarRadMJ converted to mm water equivalent: 1 MJ/m^2/day ~ 0.408 mm/day
  const et = 0.0023 * (tMean + 17.8) * Math.sqrt(deltaT) * (solarRadMJ * 0.408);
  return Math.max(1.5, Math.min(8.5, +et.toFixed(2)));
}

// Compute 5-year linear regression trend
export function computeTrend(values) {
  if (!Array.isArray(values) || values.length < 2) return {slope: 0, direction: 'stable'};
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const direction = slope > 0.05 ? 'increasing' : slope < -0.05 ? 'decreasing' : 'stable';
  return {slope: +slope.toFixed(3), direction};
}

// Harmonizes multi-source NASA observations into seasonal and annual agro-indicators
export function harmonizeEarthObservations(powerData, srtmElevation = 21, localSoil = 'loam') {
  if (!powerData || !powerData.years) return null;
  const years = powerData.years;

  // Aggregate seasonal indicators across the 5 historical years
  let totalWetRain = 0, totalDryRain = 0, totalET = 0;
  let totalFrostDays = 0, totalHeatDays = 0, totalExtremeRainDays = 0, totalHighWindDays = 0;
  let rootMoistureWetSum = 0, rootMoistureDrySum = 0, profileMoistureSum = 0;
  let countYears = years.length || 1;

  const annualDetails = years.map(y => {
    const wetRain = y.wetRain ?? Math.round(y.rain * 0.78);
    const dryRain = y.dryRain ?? Math.round(y.rain * 0.22);
    const tMax = y.tMax ?? +(y.temp + 5.5).toFixed(1);
    const tMin = y.tMin ?? +(y.temp - 6.2).toFixed(1);
    const solar = y.solar ?? 17.5;
    const et0Annual = y.et0 ?? Math.round(calculateReferenceET(tMin, tMax, y.temp, solar, 24) * 365);
    
    // Soil moisture wetness (0 to 1 scale)
    const rootMoistWet = y.rootMoistWet ?? (localSoil === 'clay' ? 0.76 : localSoil === 'sandy' ? 0.52 : 0.65);
    const rootMoistDry = y.rootMoistDry ?? (localSoil === 'clay' ? 0.48 : localSoil === 'sandy' ? 0.28 : 0.38);
    const profileMoist = y.profileMoist ?? (localSoil === 'clay' ? 0.68 : localSoil === 'sandy' ? 0.42 : 0.55);

    // Hazard occurrences
    const heatDays = y.heatDays ?? (tMax >= 36 ? Math.round(14 + (y.temp - 26) * 4) : 8);
    const frostDays = y.frostDays ?? (tMin <= 5 ? Math.round(Math.max(0, (7 - tMin) * 2)) : 0);
    const extremeRainDays = y.extremeRainDays ?? Math.round(wetRain / 280);
    const highWindDays = y.highWindDays ?? 12;

    totalWetRain += wetRain;
    totalDryRain += dryRain;
    totalET += et0Annual;
    totalHeatDays += heatDays;
    totalFrostDays += frostDays;
    totalExtremeRainDays += extremeRainDays;
    totalHighWindDays += highWindDays;
    rootMoistureWetSum += rootMoistWet;
    rootMoistureDrySum += rootMoistDry;
    profileMoistureSum += profileMoist;

    return {
      year: y.year,
      rain: y.rain,
      wetRain,
      dryRain,
      temp: y.temp,
      tMax,
      tMin,
      et0: et0Annual,
      heatDays,
      frostDays,
      extremeRainDays,
      highWindDays,
      rootMoistWet: +rootMoistWet.toFixed(2),
      rootMoistDry: +rootMoistDry.toFixed(2),
      profileMoist: +profileMoist.toFixed(2),
      // Evaporative stress ratio (Rain vs ET)
      aridityIndex: +(y.rain / Math.max(1, et0Annual)).toFixed(2)
    };
  });

  const avgWetRain = Math.round(totalWetRain / countYears);
  const avgDryRain = Math.round(totalDryRain / countYears);
  const avgAnnualRain = Math.round((totalWetRain + totalDryRain) / countYears);
  const avgAnnualET = Math.round(totalET / countYears);
  const avgRootWet = +(rootMoistureWetSum / countYears).toFixed(2);
  const avgRootDry = +(rootMoistureDrySum / countYears).toFixed(2);
  const avgProfile = +(profileMoistureSum / countYears).toFixed(2);

  // Long-term trends (5-year linear regression)
  const rainTrend = computeTrend(years.map(y => y.rain));
  const tempTrend = computeTrend(years.map(y => y.temp));
  const moistureTrend = computeTrend(annualDetails.map(y => (y.rootMoistWet + y.rootMoistDry) / 2));

  // Topographic RUSLE LS-factor from SRTM elevation & slope estimate
  // Bangladesh alluvial plains have slope 0.5%–2%, charlands 1%–3%, hilly borders 5%–15%
  const estimatedSlopePct = srtmElevation > 60 ? 4.5 : srtmElevation > 30 ? 2.0 : 0.8;
  const lsFactor = +(Math.pow(estimatedSlopePct / 9, 0.4) * 0.8).toFixed(2);

  // Soil Erodibility K-factor
  const soilKFactor = localSoil === 'sandy' ? 0.16 : localSoil === 'loam' ? 0.32 : 0.22;

  // Rainfall erosivity R-factor (MJ·mm/(ha·h·yr)) proxy from annual precipitation
  const rFactor = Math.round(0.0483 * Math.pow(avgAnnualRain, 1.61));

  // Deep aquifer trend proxy (GRACE Ganges-Brahmaputra basin average: -1.8 cm/year depletion)
  const graceGroundwaterAnomalyCmYear = -1.8;

  return {
    source: powerData.source || 'NASA Harmonized System',
    retrieved: powerData.retrieved || new Date().toISOString(),
    elevationMeters: srtmElevation,
    estimatedSlopePct,
    lsFactor,
    soilKFactor,
    rFactor,
    graceGroundwaterAnomalyCmYear,
    averages: {
      annualRain: avgAnnualRain,
      wetRain: avgWetRain,
      dryRain: avgDryRain,
      annualET0: avgAnnualET,
      waterDeficitDrySeason: Math.max(0, Math.round(avgAnnualET * 0.45 - avgDryRain)),
      rootMoistWet: avgRootWet,
      rootMoistDry: avgRootDry,
      profileMoist: avgProfile,
      annualHeatDays: Math.round(totalHeatDays / countYears),
      annualFrostDays: Math.round(totalFrostDays / countYears),
      annualExtremeRainDays: Math.round(totalExtremeRainDays / countYears),
      annualHighWindDays: Math.round(totalHighWindDays / countYears)
    },
    trends: {
      rain: rainTrend,
      temperature: tempTrend,
      soilMoisture: moistureTrend
    },
    annual: annualDetails
  };
}

// Parses enhanced NASA POWER payload with all 9 parameters
export function parseEnhancedPower(data) {
  const p = data?.properties?.parameter;
  if (!p?.PRECTOTCORR || !p?.T2M) {
    throw Error('NASA returned an incomplete rainfall or temperature series.');
  }

  const years = new Map();
  let wet = 0, dry = 0, wetDays = 0, dryDays = 0, temp = 0, tempN = 0;
  let totalHeatDays = 0, totalFrostDays = 0, totalExtremeRainDays = 0;

  for (const [date, rainVal] of Object.entries(p.PRECTOTCORR)) {
    if (!/^\d{8}$/.test(date) || !Number.isFinite(rainVal) || rainVal < 0) continue;
    const year = +date.slice(0, 4), month = +date.slice(4, 6);
    if (!years.has(year)) {
      years.set(year, {
        year,
        rain: 0,
        wetRain: 0,
        dryRain: 0,
        temp: 0,
        count: 0,
        rainDays: 0,
        tMaxSum: 0,
        tMinSum: 0,
        solarSum: 0,
        windSum: 0,
        rhSum: 0,
        rootWetSum: 0,
        rootWetN: 0,
        rootDrySum: 0,
        rootDryN: 0,
        profSum: 0,
        heatDays: 0,
        frostDays: 0,
        extremeRainDays: 0,
        highWindDays: 0
      });
    }

    const y = years.get(year);
    y.rain += rainVal;
    y.rainDays++;

    if (rainVal >= 50) {
      y.extremeRainDays++;
      totalExtremeRainDays++;
    }

    if (month >= 6 && month <= 11) {
      wet += rainVal;
      wetDays++;
      y.wetRain += rainVal;
    } else {
      dry += rainVal;
      dryDays++;
      y.dryRain += rainVal;
    }

    const t = p.T2M[date];
    if (Number.isFinite(t) && t > -90 && t < 65) {
      y.temp += t;
      y.count++;
      temp += t;
      tempN++;
    }

    // Optional enhanced parameters if present
    const tMax = p.T2M_MAX?.[date];
    if (Number.isFinite(tMax)) {
      y.tMaxSum += tMax;
      if (tMax >= 35) {
        y.heatDays++;
        totalHeatDays++;
      }
    }

    const tMin = p.T2M_MIN?.[date];
    if (Number.isFinite(tMin)) {
      y.tMinSum += tMin;
      if (tMin <= 4) {
        y.frostDays++;
        totalFrostDays++;
      }
    }

    const solar = p.ALLSKY_SFC_SW_DWN?.[date];
    if (Number.isFinite(solar) && solar > 0) y.solarSum += solar;

    const wind = p.WS2M?.[date];
    if (Number.isFinite(wind)) {
      y.windSum += wind;
      if (wind >= 5) y.highWindDays++;
    }

    const gwetroot = p.GWETROOT?.[date];
    if (Number.isFinite(gwetroot) && gwetroot >= 0) {
      if (month >= 6 && month <= 11) {
        y.rootWetSum += gwetroot;
        y.rootWetN++;
      } else {
        y.rootDrySum += gwetroot;
        y.rootDryN++;
      }
    }

    const gwetprof = p.GWETPROF?.[date];
    if (Number.isFinite(gwetprof) && gwetprof >= 0) y.profSum += gwetprof;
  }

  if (wetDays < 150 || dryDays < 150 || tempN < 300) {
    throw Error('Not enough valid observations for a seasonal summary.');
  }

  const list = [...years.values()]
    .filter(y => y.rainDays >= 330 && y.count >= 330)
    .map(y => {
      const avgTemp = +(y.temp / y.count).toFixed(1);
      const avgTMax = y.tMaxSum ? +(y.tMaxSum / y.count).toFixed(1) : +(avgTemp + 5.8).toFixed(1);
      const avgTMin = y.tMinSum ? +(y.tMinSum / y.count).toFixed(1) : +(avgTemp - 6.2).toFixed(1);
      const avgSolar = y.solarSum ? +(y.solarSum / y.count).toFixed(1) : 17.5;
      const rootWet = y.rootWetN ? +(y.rootWetSum / y.rootWetN).toFixed(2) : 0.65;
      const rootDry = y.rootDryN ? +(y.rootDrySum / y.rootDryN).toFixed(2) : 0.38;
      const prof = y.count ? +(y.profSum / y.count).toFixed(2) : 0.52;
      const et0 = Math.round(calculateReferenceET(avgTMin, avgTMax, avgTemp, avgSolar, 24) * 365);

      return {
        year: y.year,
        rain: Math.round(y.rain),
        wetRain: Math.round(y.wetRain),
        dryRain: Math.round(y.dryRain),
        temp: avgTemp,
        tMax: avgTMax,
        tMin: avgTMin,
        solar: avgSolar,
        et0,
        rootMoistWet: rootWet,
        rootMoistDry: rootDry,
        profileMoist: prof,
        heatDays: y.heatDays,
        frostDays: y.frostDays,
        extremeRainDays: y.extremeRainDays,
        highWindDays: y.highWindDays
      };
    });

  if (!list.length) throw Error('No complete historical year was returned.');

  return {
    source: 'NASA POWER Enhanced',
    wetRain: Math.round((wet / wetDays) * 183 * 0.65),
    dryRain: Math.round((dry / dryDays) * 182 * 0.65),
    temperature: +(temp / tempN).toFixed(1),
    years: list,
    retrieved: new Date().toISOString()
  };
}

// Built-in synthetic 5-year multi-sensor NASA Earth Observations datasets
// calibrated for distinct Bangladesh agro-ecological zones
export const REGIONAL_EARTH_PROFILES = {
  rajshahi: {
    regionName: 'High Barind Tract (Rajshahi)',
    elevationMeters: 21,
    years: [
      {year: 2021, rain: 1460, wetRain: 1180, dryRain: 280, temp: 26.6, tMax: 32.4, tMin: 20.1, solar: 18.2, et0: 1390, rootMoistWet: 0.68, rootMoistDry: 0.35, profileMoist: 0.51, heatDays: 14, frostDays: 0, extremeRainDays: 4, highWindDays: 10},
      {year: 2022, rain: 1170, wetRain: 940, dryRain: 230, temp: 27.1, tMax: 33.8, tMin: 20.6, solar: 19.1, et0: 1460, rootMoistWet: 0.58, rootMoistDry: 0.28, profileMoist: 0.44, heatDays: 22, frostDays: 1, extremeRainDays: 3, highWindDays: 14, event: 'Barind dry spell'},
      {year: 2023, rain: 1570, wetRain: 1290, dryRain: 280, temp: 27.4, tMax: 33.2, tMin: 21.4, solar: 17.9, et0: 1410, rootMoistWet: 0.72, rootMoistDry: 0.38, profileMoist: 0.56, heatDays: 16, frostDays: 0, extremeRainDays: 6, highWindDays: 9},
      {year: 2024, rain: 1340, wetRain: 1090, dryRain: 250, temp: 27.7, tMax: 34.6, tMin: 21.0, solar: 18.8, et0: 1480, rootMoistWet: 0.62, rootMoistDry: 0.30, profileMoist: 0.46, heatDays: 28, frostDays: 0, extremeRainDays: 4, highWindDays: 16, event: 'Extended April heatwave'},
      {year: 2025, rain: 1430, wetRain: 1160, dryRain: 270, temp: 27.2, tMax: 33.0, tMin: 20.8, solar: 18.4, et0: 1420, rootMoistWet: 0.66, rootMoistDry: 0.34, profileMoist: 0.49, heatDays: 18, frostDays: 0, extremeRainDays: 5, highWindDays: 11}
    ]
  },
  kurigram: {
    regionName: 'Brahmaputra Floodplain (Kurigram)',
    elevationMeters: 28,
    years: [
      {year: 2021, rain: 2240, wetRain: 1820, dryRain: 420, temp: 25.1, tMax: 30.5, tMin: 18.8, solar: 16.5, et0: 1280, rootMoistWet: 0.82, rootMoistDry: 0.52, profileMoist: 0.72, heatDays: 6, frostDays: 3, extremeRainDays: 9, highWindDays: 15},
      {year: 2022, rain: 2680, wetRain: 2260, dryRain: 420, temp: 25.4, tMax: 30.8, tMin: 19.2, solar: 15.8, et0: 1240, rootMoistWet: 0.94, rootMoistDry: 0.58, profileMoist: 0.85, heatDays: 4, frostDays: 2, extremeRainDays: 14, highWindDays: 18, event: 'Severe monsoon inundation'},
      {year: 2023, rain: 2150, wetRain: 1740, dryRain: 410, temp: 25.8, tMax: 31.4, tMin: 19.5, solar: 16.9, et0: 1310, rootMoistWet: 0.79, rootMoistDry: 0.48, profileMoist: 0.68, heatDays: 8, frostDays: 1, extremeRainDays: 8, highWindDays: 12},
      {year: 2024, rain: 2390, wetRain: 1950, dryRain: 440, temp: 26.0, tMax: 31.6, tMin: 19.8, solar: 16.4, et0: 1290, rootMoistWet: 0.86, rootMoistDry: 0.54, profileMoist: 0.76, heatDays: 9, frostDays: 2, extremeRainDays: 11, highWindDays: 16},
      {year: 2025, rain: 2280, wetRain: 1860, dryRain: 420, temp: 25.6, tMax: 31.0, tMin: 19.3, solar: 16.7, et0: 1300, rootMoistWet: 0.81, rootMoistDry: 0.50, profileMoist: 0.71, heatDays: 7, frostDays: 4, extremeRainDays: 10, highWindDays: 14}
    ]
  },
  rangpur: {
    regionName: 'Teesta Alluvial Basin (Rangpur)',
    elevationMeters: 34,
    years: [
      {year: 2021, rain: 1890, wetRain: 1520, dryRain: 370, temp: 25.7, tMax: 31.6, tMin: 19.2, solar: 17.1, et0: 1340, rootMoistWet: 0.71, rootMoistDry: 0.38, profileMoist: 0.58, heatDays: 10, frostDays: 2, extremeRainDays: 7, highWindDays: 13},
      {year: 2022, rain: 1720, wetRain: 1380, dryRain: 340, temp: 26.0, tMax: 32.1, tMin: 19.6, solar: 17.5, et0: 1370, rootMoistWet: 0.65, rootMoistDry: 0.32, profileMoist: 0.51, heatDays: 12, frostDays: 3, extremeRainDays: 6, highWindDays: 15},
      {year: 2023, rain: 1980, wetRain: 1610, dryRain: 370, temp: 26.2, tMax: 32.4, tMin: 19.9, solar: 17.0, et0: 1350, rootMoistWet: 0.74, rootMoistDry: 0.39, profileMoist: 0.60, heatDays: 14, frostDays: 1, extremeRainDays: 8, highWindDays: 12},
      {year: 2024, rain: 1640, wetRain: 1320, dryRain: 320, temp: 26.6, tMax: 33.2, tMin: 20.2, solar: 18.0, et0: 1420, rootMoistWet: 0.59, rootMoistDry: 0.27, profileMoist: 0.45, heatDays: 19, frostDays: 1, extremeRainDays: 5, highWindDays: 17, event: 'Charland moisture deficit'},
      {year: 2025, rain: 1850, wetRain: 1490, dryRain: 360, temp: 26.1, tMax: 32.0, tMin: 19.7, solar: 17.4, et0: 1360, rootMoistWet: 0.69, rootMoistDry: 0.36, profileMoist: 0.55, heatDays: 13, frostDays: 2, extremeRainDays: 7, highWindDays: 14}
    ]
  }
};
