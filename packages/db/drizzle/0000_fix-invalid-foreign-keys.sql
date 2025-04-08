-- Clean invalid province references
UPDATE incidents
SET provinceId = NULL
WHERE provinceId IS NOT NULL
  AND provinceId NOT IN (SELECT id FROM provinces);

-- Clean invalid canton references
UPDATE incidents
SET cantonId = NULL
WHERE cantonId IS NOT NULL
  AND cantonId NOT IN (SELECT id FROM cantons);

-- Clean invalid district references
UPDATE incidents
SET districtId = NULL
WHERE districtId IS NOT NULL
  AND districtId NOT IN (SELECT id FROM districts);
