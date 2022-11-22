import java.util.ArrayList;
import java.util.Optional;

public class Fleet {
    int name;
    int size;
    int origin;
    int destination;
    int currentTurn;
    int numberOfTurns;
    String color;

    public Fleet(String[] tokens, ArrayList<Planet> planets) {
        this.name = Integer.parseInt(tokens[1]);
        this.size = Integer.parseInt(tokens[2]);
        this.origin = Integer.parseInt(tokens[3]);
        this.destination = Integer.parseInt(tokens[4]);
        this.currentTurn = Integer.parseInt(tokens[5]);
        this.numberOfTurns = Integer.parseInt(tokens[6]);

        Optional<Planet> originPlanet = planets.stream()
                .filter(planet -> planet.name == this.origin)
                .findFirst();
        
        if (originPlanet.isEmpty()) {
            this.color = Utility.neutralColor;
            return;
        }

        this.color = originPlanet.get().color;
    }

    public boolean updateFleet(String[] tokens) {
        this.currentTurn = Integer.parseInt(tokens[5]);
        this.numberOfTurns = Integer.parseInt(tokens[6]);

        return this.currentTurn == this.numberOfTurns - 1;
    }

    public int turnsLeft() {
        return this.numberOfTurns - this.currentTurn;
    }

    @Override
    public String toString() {
        return "ID: " + this.name +
                "; FROM: " + this.origin +
                "; TO: " + this.destination +
                "; LEFT: " + (this.numberOfTurns - this.currentTurn) + ";";
    }
}
