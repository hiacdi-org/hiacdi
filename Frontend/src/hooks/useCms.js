import { useEffect, useState } from "react";
import { fetchCmsFaqs, fetchCmsHome, fetchCmsNavigation, fetchCmsPage, fetchCmsTeam, fetchSite } from "../services/api";
import { navLinks, site as fallbackSite } from "../data/site";

export function useCmsHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchCmsHome()
      .then(setData)
      .catch(() => setError("offline"));
  }, []);
  return { data, error, loading: !data && !error };
}

export function useCmsNav() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    fetchCmsNavigation()
      .then(setItems)
      .catch(() =>
        setItems(navLinks.map((link, index) => ({ id: link.to, label: link.label, url: link.to, order: index, visible: true })))
      );
  }, []);
  return items || navLinks.map((link, index) => ({ id: link.to, label: link.label, url: link.to, order: index, visible: true }));
}

export function useCmsPage(page) {
  const [data, setData] = useState({ sections: [] });
  useEffect(() => {
    fetchCmsPage(page)
      .then(setData)
      .catch(() => setData({ sections: [] }));
  }, [page]);
  return data;
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
  const [data, setData] = useState(fallbackSite);
  useEffect(() => {
    fetchSite().then(setData).catch(() => {});
  }, []);
  return data;
}
