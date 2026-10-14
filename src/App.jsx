import React, { useState, useEffect } from 'react';

// 3인이 최대인 보스 목록
const THREE_MAN_BOSSES = [
  "이지 최초의 대적자", "노말 최초의 대적자", "하드 최초의 대적자", "익스트림 최초의 대적자",
  "이지 벨로나", "노말 벨로나", "하드 벨로나",
  "노말 발드릭스", "하드 발드릭스",
  "노말 림보", "하드 림보",
  "노말 찬란한 흉성", "하드 찬란한 흉성",
  "노말 유피테르", "하드 유피테르"
];

// 전 구간 모든 보스의 순수 본명만 추출
const getBossBaseName = (fullName) => {
  return fullName
    .replace(/이지|노말|하드|카오스|익스트림/g, '') // 난이도 키워드 삭제
    .replace(/\(.*?\)/g, '')                     // 괄호 및 괄호 내용 삭제
    .replace(/주간|월간/g, '')                    // 접미사 태그 삭제
    .replace(/\s+/g, '')                         // 공백 완전 제거 
    .trim();
};

function App() {
  const [selectedBosses, setSelectedBosses] = useState([]); 
  const [result, setResult] = useState({ totalRevenue: 0, bossCount: 0 }); // 서버 결과 상태

  // 보스 카테고리 라인업
  const bossCategories = {
    "주간 보스 (초급 ~ 카루타)": [
      "카오스 자쿰", "하드 매그너스",
      "카오스 반반", "카오스 피에르", "카오스 블러디퀸", "카오스 벨룸","카오스 파풀라투스"
    ],
    "주간 보스 (스우 ~ 검밑솔)": [
      "노말 스우", "노말 데미안", "이지 루시드", "이지 윌", 
      "노말 가디언 엔젤 슬라임", "노말 루시드", "노말 윌", 
      "노말 더스크", "노말 듄켈", "하드 데미안", "하드 스우"
    ],
    "주간 보스 (상위 그란디스)": [
      "하드 루시드", "하드 윌", "노말 진 힐라", "카오스 더스크", "하드 듄켈", 
      "하드 진 힐라", "카오스 가디언 엔젤 슬라임", "노말 선택받은 세렌", 
      "이지 감시자 칼로스", "이지 최초의 대적자", "하드 선택받은 세렌", 
      "이지 카링", "이지 벨로나", "노말 감시자 칼로스", "노말 최초의 대적자", 
      "익스트림 스우", "노말 찬란한 흉성", "노말 카링", "노말 벨로나", "노말 림보"
    ],
    "월간 보스 & 엔드 콘텐츠": [
      "카오스 감시자 칼로스", "노말 발드릭스", "하드 최초의 대적자", "노말 유피테르", 
      "하드 카링", "익스트림 선택받은 세렌", "하드 림보", "하드 찬란한 흉성", 
      "하드 벨로나", "하드 발드릭스", "익스트림 감시자 칼로스", "하드 유피테르", 
      "익스트림 최초의 대적자", "하드 검은 마법사", "익스트림 카링", "익스트림 검은 마법사"
    ]
  };

  const isBossChecked = (bossName) => selectedBosses.some(b => b.name === bossName);

  const handleCheckboxChange = (bossName) => {
    if (isBossChecked(bossName)) {
      setSelectedBosses(selectedBosses.filter(b => b.name !== bossName));
    } else {
      const isMonthlyBoss = bossName.includes("검은 마법사");

      // 월간 보스가 아닐 때만 12개 한도 체크 적용
      if (!isMonthlyBoss) {
        const weeklyBossCount = selectedBosses.filter(b => !b.name.includes("검은 마법사")).length;
        if (weeklyBossCount >= 12) {
          alert("주간 보스 선택은 최대 12개까지만 가능합니다! (월간 보스는 제한 제외)");
          return;
        }
      }
      setSelectedBosses([...selectedBosses, { name: bossName, partySize: 1 }]);
    }
  };

  const handlePartySizeChange = (bossName, size) => {
    setSelectedBosses(selectedBosses.map(b => 
      b.name === bossName ? { ...b, partySize: size } : b
    ));
  };

  useEffect(() => {
    if (selectedBosses.length === 0) {
      setResult({ totalRevenue: 0, bossCount: 0 });
      return;
    }

    let isCurrent = true;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

fetch(`${BACKEND_URL}/api/calculate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    selectedBosses: selectedBosses.map(b => b.name), 
    selectedBossesWithParty: selectedBosses 
  })
})
      .then(res => res.json())
      .then(data => {
        if (isCurrent) setResult(data);
      })
      .catch(err => console.error("데이터 계산 통신 실패:", err));

    return () => { isCurrent = false; };
  }, [selectedBosses]);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <h2>메이플 보스 결정 수익 계산기</h2>
      
      {/* 결과창 */}
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px', position: 'sticky', top: '0px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <p style={{ margin: '5px 0' }}>주간 결정 판매 수: <strong>{selectedBosses.filter(b => !b.name.includes("검은 마법사")).length} / 12개</strong></p>
        <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>주간 예상 수익: <strong style={{ color: 'blue' }}>{result.totalRevenue.toLocaleString()} 메소</strong></p>
      </div>

      <div>
        {Object.keys(bossCategories).map(category => (
          <div key={category} style={{ marginBottom: '25px', background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>{category}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {bossCategories[category].map(boss => {
                const checkedItem = selectedBosses.find(b => b.name === boss);
                const isChecked = !!checkedItem;
                
                // 12개 제한 판정용 변수
                const isMonthlyBoss = boss.includes("검은 마법사");
                const weeklyBossCount = selectedBosses.filter(b => !b.name.includes("검은 마법사")).length;
                const isLimitOver = weeklyBossCount >= 12 && !isMonthlyBoss;

                // 다른 난이도의 동일 보스가 이미 선택되어 있는지 확인하는 조건 
                const currentBaseName = getBossBaseName(boss);
                const isSameBossAlreadySelected = selectedBosses.some(
                  b => b.name !== boss && getBossBaseName(b.name) === currentBaseName
                );

                // 주간 12개 한도가 넘었거나 '동일 보스의 다른 난이도'가 이미 켜져있다면 선택 불가 처리
                const isDisableMode = !isChecked && (isLimitOver || isSameBossAlreadySelected);

                const isThreeManMax = THREE_MAN_BOSSES.includes(boss);
                const maxPartyOptions = isThreeManMax ? [1, 2, 3] : [1, 2, 3,4,5,6] ;

                return (
                  <div 
                    key={boss} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '6px 10px',
                      background: isChecked ? '#e6f7ff' : '#fff',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isChecked ? '#91d5ff' : '#eee',
                      opacity: isDisableMode ? 0.35 : 1 // 중복 차단 보스 가독성 조절
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', cursor: isDisableMode ? 'not-allowed' : 'pointer', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => handleCheckboxChange(boss)} 
                        disabled={isDisableMode}
                        style={{ marginRight: '10px' }}
                      />
                      <span style={{ fontSize: '0.95rem', fontWeight: isChecked ? 'bold' : 'normal' }}>
                        {boss} {isThreeManMax && <span style={{ color: '#ff4d4f', fontSize: '0.8rem' }}>(최대 3인)</span>}
                        {isMonthlyBoss && <span style={{ color: '#722ed1', fontSize: '0.8rem' }}>(월간보스)</span>}
                      </span>
                    </label>

                    {isChecked && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>파티원:</span>
                        <select 
                          value={checkedItem.partySize} 
                          onChange={(e) => handlePartySizeChange(boss, Number(e.target.value))}
                          style={{ padding: '2px 6px', fontSize: '0.9rem', borderRadius: '4px' }}
                        >
                          {maxPartyOptions.map(num => (
                            <option key={num} value={num}>{num}명</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
