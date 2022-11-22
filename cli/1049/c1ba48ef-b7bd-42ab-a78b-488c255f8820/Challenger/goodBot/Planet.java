import java.util.ArrayList;

public class Planet {
    int name;
    int posX;
    int posY;
    float size;
    int fleetSize;
    String color;
    PlanetInfo planetInfo;

    boolean isActive = false;

    public Planet(String[] tokens) {
        this.name = Integer.parseInt(tokens[1]);
        this.posX = Integer.parseInt(tokens[2]);
        this.posY = Integer.parseInt(tokens[3]);
        this.size = Float.parseFloat(tokens[4]);
        this.fleetSize = Integer.parseInt(tokens[5]);
        this.color = tokens[6];

        this.planetInfo = new PlanetInfo(this);
        this.updatePlanetInfo();

        this.activate();
    }

    public Planet() { }
    
    public void updatePlanet(String[] tokens) {
        this.fleetSize = Integer.parseInt(tokens[5]);
        this.color = tokens[6];
        this.updatePlanetInfo();
    }
    
    public void updatePlanetInfo() {
        this.planetInfo.update(this);
        this.planetInfo.clear();
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void addFleet(Fleet fleet, int currentTurn) {
        this.planetInfo.add(fleet, currentTurn);
    }

    public PlanetEvent getPlanetInfoAtTurn(int turnNumber, int currentTurn) {
        return this.planetInfo.get(turnNumber, currentTurn);
    }

    public DefendInfo isInDanger(int currentTurn, int withoutFleetSize) {
        return this.planetInfo.isInDanger(currentTurn, withoutFleetSize);
    }
    
    public float frontierMetric(ArrayList<Planet> planets) {
        float totalDistance = 0;
        for (Planet planet : planets) {
            totalDistance += Utility.numberOfTurns(this, planet);
        }

        return totalDistance / planets.size();
    }
    
    public int sendfleetSizeInNTurns(int numberOfTurns, int currentTurn) {
        int res = 0;
        int tempFleetSize = this.fleetSize;
        int taken = 0;
        for (int i = 0; i < numberOfTurns; i++) {
            taken = (int) (tempFleetSize * 0.5);
            res += taken;
            if (i == numberOfTurns - 1) {
                break;
            }
            tempFleetSize = this.getPlanetInfoAtTurn(i + 1, currentTurn).fleetSize - taken;
        }

        if (this.isInDanger(currentTurn, res).inDangerTurn != -1) {
            return 0;
        }

        return res;
    }
    
    public int sendfleetSize(int currentTurn) {
        int tempFleetSize = (int) (this.fleetSize * 0.5);

        if (this.isInDanger(currentTurn, tempFleetSize).inDangerTurn != -1) {
            return 0;
        }

        return tempFleetSize;
    }

    @Override
    public String toString() {
        return "ID: " + this.name +
                "; FLEET " + this.fleetSize +
                "; ACTIVE " + this.isActive;
    }
}