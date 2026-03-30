import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE = 'https://provinces.open-api.vn/api';

// Xóa prefix "Tỉnh " / "Thành phố " cho gọn
const cleanName = (name = '') =>
  name.replace(/^(Tỉnh |Thành phố )/, '');

export function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  useEffect(() => {
    setLoadingProvinces(true);
    axios.get(`${BASE}/?depth=1`)
      .then(res => setProvinces(
        res.data.map(p => ({ code: p.code, name: cleanName(p.name), fullName: p.name }))
      ))
      .catch(() => {})
      .finally(() => setLoadingProvinces(false));
  }, []);

  return { provinces, loadingProvinces };
}

export async function fetchDistricts(provinceCode) {
  const res = await axios.get(`${BASE}/p/${provinceCode}?depth=2`);
  return (res.data.districts || []).map(d => ({
    code: d.code,
    name: d.name  // "Quận 1", "Huyện Nhà Bè" — giữ nguyên
  }));
}
