// 關卡儲存/載入服務 - 支援 Firebase 和 localStorage
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

/**
 * 儲存自定義關卡到 Firebase Firestore
 * @param {number} levelNumber - 關卡編號 (1-15)
 * @param {Object} levelData - 關卡資料
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveCustomLevel = async (levelNumber, levelData) => {
  try {
    if (!db) {
      // Firebase 未初始化，使用 localStorage 作為備用
      console.warn('⚠️ Firebase 未初始化，使用 localStorage 儲存');
      localStorage.setItem(`custom-level-${levelNumber}`, JSON.stringify(levelData));
      return { success: true, storage: 'localStorage' };
    }

    // 儲存到 Firestore: collection: "customLevels", document: "level-{number}"
    const levelRef = doc(db, 'customLevels', `level-${levelNumber}`);
    await setDoc(levelRef, {
      levelNumber,
      data: levelData,
      updatedAt: new Date().toISOString(),
      version: '3.9.0'
    });

    console.log(`✅ 關卡 ${levelNumber} 已儲存至 Firebase`);

    // 同時儲存到 localStorage 作為本地快取
    localStorage.setItem(`custom-level-${levelNumber}`, JSON.stringify(levelData));

    return { success: true, storage: 'firebase' };
  } catch (error) {
    console.error('❌ Firebase 儲存失敗:', error);

    // 失敗時使用 localStorage 作為備用
    try {
      localStorage.setItem(`custom-level-${levelNumber}`, JSON.stringify(levelData));
      console.log('✅ 已使用 localStorage 作為備用儲存');
      return { success: true, storage: 'localStorage', warning: error.message };
    } catch (localError) {
      return { success: false, error: localError.message };
    }
  }
};

/**
 * 從 Firebase Firestore 載入自定義關卡
 * @param {number} levelNumber - 關卡編號 (1-15)
 * @returns {Promise<{data: Object|null, source: string}>}
 */
export const loadCustomLevel = async (levelNumber) => {
  try {
    if (!db) {
      // Firebase 未初始化，從 localStorage 載入
      console.warn('⚠️ Firebase 未初始化，從 localStorage 載入');
      const savedLevel = localStorage.getItem(`custom-level-${levelNumber}`);
      if (savedLevel) {
        return { data: JSON.parse(savedLevel), source: 'localStorage' };
      }
      return { data: null, source: 'none' };
    }

    // 從 Firestore 載入
    const levelRef = doc(db, 'customLevels', `level-${levelNumber}`);
    const docSnap = await getDoc(levelRef);

    if (docSnap.exists()) {
      const firebaseData = docSnap.data();
      console.log(`✅ 從 Firebase 載入關卡 ${levelNumber}`);

      // 更新本地快取
      localStorage.setItem(`custom-level-${levelNumber}`, JSON.stringify(firebaseData.data));

      return { data: firebaseData.data, source: 'firebase' };
    }

    // Firebase 沒有，檢查 localStorage
    const savedLevel = localStorage.getItem(`custom-level-${levelNumber}`);
    if (savedLevel) {
      console.log(`📦 從 localStorage 載入關卡 ${levelNumber}`);
      return { data: JSON.parse(savedLevel), source: 'localStorage' };
    }

    return { data: null, source: 'none' };
  } catch (error) {
    console.error('❌ Firebase 載入失敗:', error);

    // 失敗時從 localStorage 載入
    try {
      const savedLevel = localStorage.getItem(`custom-level-${levelNumber}`);
      if (savedLevel) {
        console.log('✅ 已使用 localStorage 作為備用載入');
        return { data: JSON.parse(savedLevel), source: 'localStorage' };
      }
      return { data: null, source: 'none' };
    } catch (localError) {
      console.error('❌ localStorage 載入也失敗:', localError);
      return { data: null, source: 'error' };
    }
  }
};

/**
 * 刪除自定義關卡（從 Firebase 和 localStorage）
 * @param {number} levelNumber - 關卡編號 (1-15)
 * @returns {Promise<{success: boolean}>}
 */
export const deleteCustomLevel = async (levelNumber) => {
  try {
    // 從 localStorage 刪除
    localStorage.removeItem(`custom-level-${levelNumber}`);

    if (db) {
      // 從 Firebase 刪除
      const levelRef = doc(db, 'customLevels', `level-${levelNumber}`);
      await setDoc(levelRef, {
        levelNumber,
        data: null,
        deletedAt: new Date().toISOString()
      });
      console.log(`🗑️ 關卡 ${levelNumber} 已從 Firebase 刪除`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ 刪除關卡失敗:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 檢查關卡是否有自定義版本
 * @param {number} levelNumber - 關卡編號 (1-15)
 * @returns {Promise<boolean>}
 */
export const hasCustomLevel = async (levelNumber) => {
  try {
    const result = await loadCustomLevel(levelNumber);
    return result.data !== null;
  } catch (error) {
    return false;
  }
};
