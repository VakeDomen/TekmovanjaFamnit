import java.util.ArrayList;
import java.util.Map;
import java.util.TreeMap;

public class PlanetInfo {
    private Planet planet;
    TreeMap<Integer, PlanetEvent> planetEvents;

    public PlanetInfo(Planet planet) {
        this.planet = planet;
        this.planetEvents = new TreeMap<>();
    } 

    public PlanetInfo(Planet planet, ArrayList<PlanetEvent> planetEvents) {
        this.planet = planet;
        this.planetEvents = new TreeMap<>();
        planetEvents.forEach(
                planetEvent -> this.planetEvents.put(planetEvent.turnNumber, planetEvent));
    }

    public void update(Planet planet) {
        this.planet = planet;
    }

    public void put(PlanetEvent planetEvent) {
        this.planetEvents.put(planetEvent.turnNumber, planetEvent);
    }
    
    public void add(Fleet fleet, int currentTurn) {
        int turnNumber = currentTurn + fleet.turnsLeft();
        PlanetEvent planetEvent = this.planetEvents.getOrDefault(turnNumber,
                new PlanetEvent(turnNumber, 0, this.planet.color, fleet.color));

        planetEvent.fleetSize += (this.planet.color.equals(fleet.color)) ? fleet.size : -fleet.size;
        this.put(planetEvent);
    }

    public PlanetEvent get(int turnNumber, int currentTurn) {
        // this.removePassedTurns(currentTurn);
        int productionCoef = this.planet.color.equals(Utility.neutralColor) ? 0 : Utility.productionCoef;
        int resFleetSize = this.planet.fleetSize;
        String attackerColor = this.planet.color;
        for (Map.Entry<Integer, PlanetEvent> mapElement : this.planetEvents.entrySet()) {
            if (mapElement.getKey() > turnNumber) {
                break;
            }

            resFleetSize += mapElement.getValue().fleetSize;
            attackerColor = mapElement.getValue().attackerColor;
        }

        float production = (turnNumber - currentTurn) * productionCoef * this.planet.size;
        resFleetSize += production;
        String tempColor;
        if (resFleetSize < 0) {
            tempColor = attackerColor;
        } else if (resFleetSize == 0) {
            tempColor = Utility.neutralColor;
        } else {
            tempColor = this.planet.color;
        }
        return new PlanetEvent(turnNumber,
                resFleetSize,
                tempColor,
                attackerColor);
    }
    
    public void clear() {
        this.planetEvents.clear();
    }
    
    public DefendInfo isInDanger(int currentTurn, int withoutFleetSize) {
        // this.removePassedTurns(currentTurn);
        int productionCoef = this.planet.color.equals(Utility.neutralColor) ? 0 : Utility.productionCoef;

        int resFleetSize = this.planet.fleetSize - withoutFleetSize;
        int tempCurrentTurn = currentTurn;
        for (Map.Entry<Integer, PlanetEvent> mapElement : this.planetEvents.entrySet()) {
            Integer mapElementTurn = mapElement.getKey();

            float production = (mapElementTurn - tempCurrentTurn) * productionCoef * this.planet.size;
            resFleetSize += production;
            resFleetSize += mapElement.getValue().fleetSize;
            tempCurrentTurn = mapElementTurn;

            if (resFleetSize <= 0) {
                return new DefendInfo(tempCurrentTurn, resFleetSize, this.planet);
            }
        }

        return new DefendInfo();
    }

    public void removePassedTurns(int currentTurn) {
        if (this.planetEvents == null) {
            return;
        }

        for (int key : this.planetEvents.keySet()) {
            if (key <= currentTurn) {
                this.planetEvents.remove(key);
            } else {
                return;
            }
        }
    }
}