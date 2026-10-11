import { useEffect, useState } from "react";
import { fetchPublicGallery, fetchPublicPost, fetchPublicPosts, fetchPublicResources } from "../services/api";

function useList(loader, label) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setError("");
    loader()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => {
        setRows([]);
        setError(`Could not load ${label} from the server.`);
      });
  }

  useEffect(() => {
    load();
  }, []);

  return { rows: rows || [], loading: rows === null, error, retry: load };
}

export function usePublicPosts() {
  return useList(fetchPublicPosts, "news");
}

export function usePublicGallery() {
  return useList(fetchPublicGallery, "gallery");
}

export function usePublicResources() {
  return useList(fetchPublicResources, "resources");
}

export function usePublicPost(slug) {
  const [post, setPost] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setPost(null);
      return;
    }
    setPost(undefined);
    fetchPublicPost(slug)
      .then(setPost)
      .catch(() => {
        setPost(null);
        setError("not-found");
      });
  }, [slug]);

  return { post, loading: post === undefined, error };
}
