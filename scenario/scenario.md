#### playground.plus utterance ####

#### 버스번호를 입력받는 경우

- 사용자가 어떤 명령을 할 것인가?
  - 106번 버스 언제 와?
    > 정류장을 사용자가 특정하기가 어렵기 때문에 `즐겨찾기`가 필요 
    >
    > 중요 명명 : 106

  - 삼성화재유성연수원에서 충남대학교가는 111번 버스 언제 도착해?
    > 중요 명명 : 삼성화재유성연수원, 충남대학교, 111

- 결과로 보여줘야 하는 것들
  - 버스오는데 걸리는 시간
    > ex) `106` 번 버스가 `5` 분 후 도착합니다. 

- Action :  busTime (발화 함수)
- Concepts 
  - Input Concept : Origin(Name), Destination(Name), BusNumber(Integer)
  - Output Concept : Results (Structure)
    > Results에 포함될 concepts : BusNumber(Integer), Time(Integer)