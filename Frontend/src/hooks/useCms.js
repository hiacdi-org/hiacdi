import { useEffect, useState } from "react";
import { fetchCmsFaqs, fetchCmsPage, fetchCmsTeam } from "../services/api";
import { usePublicCms } from "../context/PublicCmsContext";

export function useCmsHome() {
  const { data, error, loading, retry } = usePublicCms();
  return { data, error, loading, retry };
}

export function useCmsNav() {
  return usePublicCms().nav;
}

export function useCmsPage(page) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchCmsPage(page)
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch(() => {
        if (!cancelled) {
          setData({ sections: [] });
          setError("offline");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return { ...(data || { sections: [] }), error, loading: data === null };
}

export function useCmsTeam() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    fetchCmsTeam().then(setRows).catch(() => setRows([]));
  }, []);
  return rows;
}

export function useCmsFaqs() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    fetchCmsFaqs().then(setRows).catch(() => setRows([]));
  }, []);
  return rows;
}

export function usePublicSite() {
  const { site, error, loading, retry } = usePublicCms();
  return { ...site, error, loading, retry };
}
