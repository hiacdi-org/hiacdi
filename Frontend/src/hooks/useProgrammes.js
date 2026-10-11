import { useEffect, useState } from "react";
import { fetchProgrammes } from "../services/api";
import { findProgrammeGroup, findProgrammeItem, groupProgrammes } from "../utils/programmesView";
import { usePublicCms } from "../context/PublicCmsContext";

export function useProgrammes(groupSlug) {
  const { programmeGroups } = usePublicCms();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setError("");
    const query = groupSlug ? `?group=${encodeURIComponent(groupSlug)}` : "?groups=1";
    fetchProgrammes(query)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => {
        setRows([]);
        setError("Could not load programmes from the server.");
      });
  }

  useEffect(() => {
    if (!groupSlug && programmeGroups.length) {
      setRows(programmeGroups);
      return;
    }
    load();
  }, [groupSlug]);

  const list = rows || [];
  const groups = groupSlug ? groupProgrammes(list) : list;
  return {
    rows: list,
    groups,
    loading: rows === null,
    error,
    retry: load,
    findGroup: (slug) => findProgrammeGroup(list, slug) || groups.find((row) => row.slug === slug) || null,
    findItem: (g, itemSlug) => findProgrammeItem(list, g, itemSlug),
  };
}
